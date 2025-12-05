import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { roomRegistrationApi } from '../../api';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import RejectionModal from '../../components/modal/RejectionModal';
import BaseModal, { ModalBody } from '../../components/modal/BaseModal';

const ExtensionApprovalPage = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('All'); // Match backend: All, Unapproved, Approved
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0
  });

  useEffect(() => {
    loadExtendRoomRequests();
  }, [filterStatus, currentPage, searchKeyword, startDate, endDate]);

  const loadExtendRoomRequests = async () => {
    try {
      setLoading(true);
      const statusParam = filterStatus === 'All' ? 'All' : filterStatus === 'Unapproved' ? 'Unapproved' : 'Approved';
      
      const params = {
        status: statusParam,
        page: currentPage,
        limit: itemsPerPage,
        keyword: searchKeyword.trim() || undefined
      };

      // Add date filter
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      
      const response = await roomRegistrationApi.getExtendRoomRequests(params);
      
      const data = response.data || [];
      const totalItems = response.totalItems || 0;
      
      // Update statistics from API response
      setStatistics({
        total: totalItems,
        pending: response.totalUnapproved || 0,
        approved: response.totalApproved || 0
      });
      
      if (Array.isArray(data)) {
        const transformed = data.map(item => ({
          id: item.id,
          studentId: item.studentId,
          userId: item.userId,
          studentName: item.name,
          studentEmail: item.email || '',
          studentPhone: item.phone || '',
          studentIdNumber: item.identification || item.mssv,
          mssv: item.mssv,
          school: item.school,
          dob: item.dob,
          gender: item.gender,
          address: item.address,
          avatar: item.avatar,
          frontIdentificationImage: item.frontIdentificationImage,
          currentRoom: {
            roomNumber: item.roomNumber || '-',
            building: '-',
            zone: '-',
            roomType: '-',
            monthlyFee: item.monthlyFee || 0
          },
          slotNumber: item.slotNumber,
          extension: {
            duration: item.newDuration || 0,
            newEndDate: item.newEndDate || '',
            estimatedFee: (item.monthlyFee || 0) * (item.newDuration || 0)
          },
          contract: {
            contractId: item.id,
            startDate: item.registerDate || '',
            endDate: item.endDate || '',
            duration: item.duration || 0
          },
          registerDate: item.registerDate,
          approvedDate: item.approvedDate,
          status: item.status === 'REJECTED' || item.status === 'REJECT' ? 'rejected' :
                  item.status === 'EXTENDED' ? 'approved' : 
                  'pending'
        }));
        
        const sorted = transformed.sort((a, b) => {
          if (a.status === 'pending' && b.status === 'approved') return -1;
          if (a.status === 'approved' && b.status === 'pending') return 1;
          return new Date(b.registerDate || 0) - new Date(a.registerDate || 0);
        });
        setExtensionRequests(sorted);
        setTotalItems(totalItems);
        
        setSelectedRequests(prev => {
          return prev.filter(id => {
            const request = transformed.find(req => req.id === id);
            return request && request.status !== 'approved' && request.status !== 'rejected';
          });
        });
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentRequests = extensionRequests;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedRequests([]);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleSelectRequest = (requestId) => {
    const request = currentRequests.find(req => req.id === requestId);
    if (request && (request.status === 'approved' || request.status === 'rejected')) {
      return;
    }
    
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    const selectableRequests = currentRequests.filter(req => req.status !== 'approved' && req.status !== 'rejected');
    const selectableIds = selectableRequests.map(req => req.id);
    const allSelected = selectableIds.every(id => selectedRequests.includes(id));
    
    if (allSelected && selectableIds.length > 0) {
      setSelectedRequests(prev => prev.filter(id => !selectableIds.includes(id)));
    } else {
      setSelectedRequests(prev => {
        const newSelection = [...prev];
        selectableIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequestDetail(request);
    setShowDetailModal(true);
  };

  const handleApproveRequests = async () => {
    if (selectedRequests.length === 0) {
      showError('Vui lòng chọn ít nhất một đơn để duyệt');
      return;
    }

    setApproveLoading(true);
    try {
      const response = await roomRegistrationApi.approveRoomExtend(selectedRequests);
      
      if (response.success !== false) {
        showSuccess(response.message || response.data?.message || 'Duyệt đơn gia hạn thành công!');
      } else {
        showError(response.message || response.data?.message || 'Có lỗi xảy ra khi duyệt đơn.');
      }
      
      await loadExtendRoomRequests();
      
      setSelectedRequests([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      showError(errorMessage);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectRequests = () => {
    if (selectedRequests.length === 0) {
      showError('Vui lòng chọn ít nhất một đơn để từ chối');
      return;
    }
    setShowRejectionModal(true);
  };

  const handleConfirmRejection = async (reasonsData) => {
    if (selectedRequests.length === 0) {
      showError('Vui lòng chọn ít nhất một đơn để từ chối');
      return;
    }

    setRejectLoading(true);
    try {
      const response = await roomRegistrationApi.rejectRoomExtend(selectedRequests, reasonsData);
      
      if (response.success !== false) {
        showSuccess(response.message || response.data?.message || 'Từ chối đơn gia hạn thành công!');
      } else {
        showError(response.message || response.data?.message || 'Có lỗi xảy ra khi từ chối đơn.');
      }
      
      setShowRejectionModal(false);
      
      await loadExtendRoomRequests();
      
      setSelectedRequests([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi từ chối đơn. Vui lòng thử lại.');
    } finally {
      setRejectLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };


  return (
    <PageLayout
      title="Duyệt đơn gia hạn KTX"
      subtitle="Quản lý và duyệt các đơn gia hạn ký túc xá của sinh viên"
      showClose={true}
      onClose={onCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Tổng đơn</p>
              <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-900">{statistics.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-900">{statistics.approved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-32">
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">Tất cả</option>
              <option value="Unapproved">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
            </Select>
          </div>
          <div className="w-40">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              onClear={startDate ? () => {
                setStartDate('');
                setCurrentPage(1);
              } : undefined}
              placeholder="Từ ngày"
              size="medium"
            />
          </div>
          <div className="w-40">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              onClear={endDate ? () => {
                setEndDate('');
                setCurrentPage(1);
              } : undefined}
              placeholder="Đến ngày"
              size="medium"
            />
          </div>
          <div className="flex-1">
            <Input
              variant="search"
              placeholder="Tìm kiếm theo tên, MSSV, số phòng..."
              value={searchKeyword}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              size="medium"
            />
          </div>
        </div>
      </div>

      {selectedRequests.length > 0 && (
        <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <span className="text-blue-800 font-medium">Đã chọn {selectedRequests.length} đơn</span>
          <Button
            onClick={handleApproveRequests}
            variant="success"
            loading={approveLoading}
            loadingText="Đang duyệt..."
          >
            Duyệt đã chọn
          </Button>
          <Button
            onClick={handleRejectRequests}
            variant="danger"
            loading={rejectLoading}
            loadingText="Đang từ chối..."
          >
            Từ chối đã chọn
          </Button>
        </div>
      )}

      <LoadingState
        isLoading={loading}
        isEmpty={!loading && extensionRequests.length === 0}
        emptyState={
          <div className="text-center py-12 text-gray-500">
            <p>Không có đơn gia hạn nào.</p>
          </div>
        }
      >
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        currentRequests.filter(req => req.status !== 'approved' && req.status !== 'rejected').length > 0 &&
                        currentRequests
                          .filter(req => req.status !== 'approved' && req.status !== 'rejected')
                          .every(req => selectedRequests.includes(req.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={currentRequests.filter(req => req.status !== 'approved' && req.status !== 'rejected').length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian gia hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phí dự kiến
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        disabled={request.status === 'approved' || request.status === 'rejected'}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          request.status === 'approved' || request.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                        <div className="text-sm text-gray-500">{request.mssv || request.studentIdNumber}</div>
                        {request.studentEmail && (
                          <div className="text-sm text-gray-500">{request.studentEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.currentRoom.roomNumber}</div>
                        <div className="text-sm text-gray-500">Vị trí {request.slotNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.extension.duration} tháng</div>
                      {request.extension.newEndDate && (
                        <div className="text-sm text-gray-500">Đến: {formatDate(request.extension.newEndDate)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(request.extension.estimatedFee)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={request.status} isApprovalStatus={true} size="small" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="link"
                        onClick={() => handleViewDetail(request)}
                        size="small"
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              showInfo={true}
            />
          </div>
        )}
      </LoadingState>

      <BaseModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết đơn gia hạn"
        size="xlarge"
        closeOnOverlayClick={true}
        className="max-h-[105vh] overflow-y-auto"
        zIndex={60}
      >
        <ModalBody className="max-h-[calc(105vh-200px)] overflow-y-auto">
          {selectedRequestDetail && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin sinh viên</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Họ tên</label>
                    <p className="text-gray-900">{selectedRequestDetail.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">MSSV</label>
                    <p className="text-gray-900">{selectedRequestDetail.mssv || selectedRequestDetail.studentIdNumber}</p>
                  </div>
                  {selectedRequestDetail.dob && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                      <p className="text-gray-900">{formatDate(selectedRequestDetail.dob)}</p>
                    </div>
                  )}
                  {selectedRequestDetail.gender && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                      <p className="text-gray-900">{selectedRequestDetail.gender === 'male' ? 'Nam' : 'Nữ'}</p>
                    </div>
                  )}
                  {selectedRequestDetail.address && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                      <p className="text-gray-900">{selectedRequestDetail.address}</p>
                    </div>
                  )}
                  {selectedRequestDetail.school && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Trường</label>
                      <p className="text-gray-900">{selectedRequestDetail.school}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin phòng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phòng</label>
                    <p className="text-gray-900">{selectedRequestDetail.currentRoom.roomNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vị trí</label>
                    <p className="text-gray-900">Vị trí {selectedRequestDetail.slotNumber}</p>
                  </div>
                  {selectedRequestDetail.contract.duration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời hạn hiện tại</label>
                      <p className="text-gray-900">{selectedRequestDetail.contract.duration} tháng</p>
                    </div>
                  )}
                  {selectedRequestDetail.currentRoom.monthlyFee && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phí hàng tháng</label>
                      <p className="text-gray-900">{formatCurrency(selectedRequestDetail.currentRoom.monthlyFee)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin gia hạn</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequestDetail.contract.endDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày hết hạn hiện tại</label>
                      <p className="text-gray-900">{formatDate(selectedRequestDetail.contract.endDate)}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Thời gian gia hạn</label>
                    <p className="text-gray-900">{selectedRequestDetail.extension.duration} tháng</p>
                  </div>
                  {selectedRequestDetail.extension.newEndDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày hết hạn mới</label>
                      <p className="text-gray-900">{formatDate(selectedRequestDetail.extension.newEndDate)}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phí dự kiến</label>
                    <p className="text-gray-900 font-semibold">{formatCurrency(selectedRequestDetail.extension.estimatedFee)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button onClick={() => setShowDetailModal(false)} variant="outline">
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </ModalBody>
      </BaseModal>

      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleConfirmRejection}
        title="Nhập lý do từ chối đơn gia hạn"
        selectedItems={currentRequests.filter(req => selectedRequests.includes(req.id))}
        onViewDetail={(item) => {
          handleViewDetail(item);
        }}
        onRemoveItem={(itemId) => {
          setSelectedRequests(prev => {
            const newSelection = prev.filter(id => id !== itemId);
            if (newSelection.length === 0) {
              setShowRejectionModal(false);
            }
            return newSelection;
          });
        }}
      />
    </PageLayout>
  );
};

export default ExtensionApprovalPage;
