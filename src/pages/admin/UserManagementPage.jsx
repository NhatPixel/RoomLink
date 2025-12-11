import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import userApi from '../../api/userApi';
import PageLayout from '../../components/layout/PageLayout';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import BaseModal, { ModalBody } from '../../components/modal/BaseModal';
import RejectionModal from '../../components/modal/RejectionModal';
import { getUserStatusBadgeProps } from '../../utils/roomStatusUtils';
import defaultAvatar from '../../assets/default_avatar_3x4.jpg';
import defaultIdCard from '../../assets/default_id_card.jpg';

const UserManagementPage = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [lockLoading, setLockLoading] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('All'); // All, Locked, UnLocked
  const [searchKeyword, setSearchKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [statistics, setStatistics] = useState({
    total: 0,
    locked: 0,
    unlocked: 0
  });

  useEffect(() => {
    loadUsers();
  }, [filterStatus, currentPage, searchKeyword, startDate, endDate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        status: filterStatus,
        page: currentPage,
        limit: itemsPerPage,
        keyword: searchKeyword.trim() || undefined
      };

      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await userApi.getAllUser(params);
      
      // axiosClient already returns response.data, so response is ApiResponse object
      // ApiResponse structure: { success, data, page, limit, totalItems, totalApproved, totalUnapproved }
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      console.log('Response totalItems:', response.totalItems);
      console.log('Response totalApproved:', response.totalApproved);
      console.log('Response totalUnapproved:', response.totalUnapproved);
      
      const data = response.data || [];
      const totalItems = response.totalItems || 0;
      
      // Update statistics from API response
      // Note: Backend logic - totalApproved is LOCKED count, totalUnapproved is UNLOCKED count
      setStatistics({
        total: totalItems,
        unlocked: response.totalUnapproved || 0,
        locked: response.totalApproved || 0
      });
      
      console.log('Parsed data:', data);
      console.log('Data length:', data.length);
      if (data.length > 0) {
        console.log('First item:', data[0]);
      }
      
      if (Array.isArray(data)) {
        const transformed = data.map(item => {
          // GetAllUserResponse already transforms the data, so we can use it directly
          // But we need to handle cases where RoomRegistrations might not exist
          return {
            id: item.id,
            name: item.name,
            identification: item.identification,
            dob: item.dob,
            gender: item.gender,
            email: item.email,
            status: item.status,
            avatar: item.avatar,
            frontIdentificationImage: item.frontIdentificationImage,
            mssv: item.mssv || null,
            school: item.school || null,
            slotNumber: item.slotNumber || null,
            roomNumber: item.roomNumber || null,
            registerDate: item.registerDate || null,
            approvedDate: item.approvedDate || null,
            duration: item.duration || null,
            endDate: item.endDate || null
          };
        });
        
        setUsers(transformed);
        setTotalItems(totalItems);
        
        // Clear selected users that are no longer in the list or have changed status
        setSelectedUsers(prev => {
          return prev.filter(id => {
            const user = transformed.find(u => u.id === id);
            return user && user.status === transformed.find(u => u.id === id)?.status;
          });
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách người dùng';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentUsers = users;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedUsers([]);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const handleSelectUser = (userId) => {
    // Allow selecting any user regardless of filter
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    // Select all users on current page
    const allUserIds = currentUsers.map(u => u.id);
    const allSelected = allUserIds.every(id => selectedUsers.includes(id));

    if (allSelected && allUserIds.length > 0) {
      // Deselect all
      setSelectedUsers(prev => prev.filter(id => !allUserIds.includes(id)));
    } else {
      // Select all
      setSelectedUsers(prev => {
        const newSelection = [...prev];
        allUserIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUserDetail(user);
    setShowDetailModal(true);
  };

  const handleLockUsers = () => {
    // Filter only unlocked users
    const unlockedUserIds = selectedUsers.filter(id => {
      const user = currentUsers.find(u => u.id === id);
      return user && user.status !== 'LOCKED';
    });

    if (unlockedUserIds.length === 0) {
      showError('Vui lòng chọn ít nhất một người dùng chưa bị khóa');
      return;
    }

    // Update selection to only unlocked users before showing modal
    setSelectedUsers(unlockedUserIds);
    setShowLockModal(true);
  };

  const handleConfirmLock = async (reasonsData) => {
    // Filter only unlocked users again to be safe
    const unlockedUserIds = selectedUsers.filter(id => {
      const user = currentUsers.find(u => u.id === id);
      return user && user.status !== 'LOCKED';
    });

    if (unlockedUserIds.length === 0) {
      showError('Vui lòng chọn ít nhất một người dùng để khóa');
      return;
    }

    setLockLoading(true);
    try {
      // Transform reasonsData to match backend validation schema
      // Backend expects: { ids, reason?, reasons? }
      // RejectionModal sends: { type: 'common'|'individual', reason?, reasons? }
      const payload = { ids: unlockedUserIds };

      if (reasonsData.type === 'common') {
        // Send common reason
        if (reasonsData.reason) {
          payload.reason = reasonsData.reason;
        }
      } else if (reasonsData.type === 'individual') {
        // Send individual reasons
        if (reasonsData.reasons) {
          payload.reasons = reasonsData.reasons;
        }
      }

      const response = await userApi.lockUser(payload);

      if (response.success !== false) {
        showSuccess(response.message || 'Khóa tài khoản thành công!');
      } else {
        showError(response.message || 'Có lỗi xảy ra khi khóa tài khoản.');
      }

      setShowLockModal(false);
      await loadUsers();
      setSelectedUsers([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi khóa tài khoản. Vui lòng thử lại.';
      showError(errorMessage);
    } finally {
      setLockLoading(false);
    }
  };

  const handleUnlockUsers = async () => {
    // Filter only locked users
    const lockedUserIds = selectedUsers.filter(id => {
      const user = currentUsers.find(u => u.id === id);
      return user && user.status === 'LOCKED';
    });

    if (lockedUserIds.length === 0) {
      showError('Vui lòng chọn ít nhất một người dùng đã bị khóa');
      return;
    }

    setUnlockLoading(true);
    try {
      const response = await userApi.unLockUser({ ids: lockedUserIds });

      if (response.success !== false) {
        showSuccess(response.message || 'Mở khóa tài khoản thành công! Mật khẩu mặc định là 123456');
      } else {
        showError(response.message || 'Có lỗi xảy ra khi mở khóa tài khoản.');
      }

      await loadUsers();
      setSelectedUsers([]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi mở khóa tài khoản. Vui lòng thử lại.';
      showError(errorMessage);
    } finally {
      setUnlockLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const { text, color } = getUserStatusBadgeProps(status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {text}
      </span>
    );
  };

  const allUserIds = currentUsers.map(u => u.id);
  const allSelected = allUserIds.length > 0 && allUserIds.every(id => selectedUsers.includes(id));

  return (
    <PageLayout
      title="Quản lý người dùng"
      subtitle="Quản lý và khóa/mở khóa tài khoản người dùng"
      showClose={true}
      onClose={onCancel}
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Tổng số người dùng</p>
              <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Không khóa</p>
              <p className="text-2xl font-bold text-green-900">{statistics.unlocked}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Đã khóa</p>
              <p className="text-2xl font-bold text-red-900">{statistics.locked}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="w-48">
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="All">Tất cả</option>
              <option value="UnLocked">Đã mở khóa</option>
              <option value="Locked">Đã khóa</option>
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
              placeholder="Tìm kiếm theo tên, MSSV, số phòng, CCCD..."
              value={searchKeyword}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
              size="medium"
            />
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (() => {
        const selectedUsersData = currentUsers.filter(u => selectedUsers.includes(u.id));
        const lockedCount = selectedUsersData.filter(u => u.status === 'LOCKED').length;
        const unlockedCount = selectedUsersData.filter(u => u.status !== 'LOCKED').length;

        return (
          <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg">
            <span className="text-blue-800 font-medium">
              Đã chọn {selectedUsers.length} người dùng
              {lockedCount > 0 && ` (${lockedCount} đã khóa)`}
              {unlockedCount > 0 && ` (${unlockedCount} chưa khóa)`}
            </span>
            {unlockedCount > 0 && (
              <Button
                onClick={handleLockUsers}
                variant="danger"
                loading={lockLoading}
                loadingText="Đang khóa..."
              >
                Khóa {unlockedCount > 0 ? `${unlockedCount} tài khoản` : ''}
              </Button>
            )}
            {lockedCount > 0 && (
              <Button
                onClick={handleUnlockUsers}
                variant="success"
                loading={unlockLoading}
                loadingText="Đang mở khóa..."
              >
                Mở khóa {lockedCount > 0 ? `${lockedCount} tài khoản` : ''}
              </Button>
            )}
          </div>
        );
      })()}

      <LoadingState
        isLoading={loading}
        isEmpty={!loading && users.length === 0}
        emptyState={
          <div className="text-center py-12 text-gray-500">
            <p>Không có người dùng nào.</p>
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
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={currentUsers.length === 0}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MSSV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
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
                {currentUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.mssv || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.roomNumber || '-'}</div>
                          {user.slotNumber && (
                            <div className="text-sm text-gray-500">Vị trí {user.slotNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(user.registerDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="link"
                          onClick={() => handleViewDetail(user)}
                          size="small"
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })}
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
        onClose={() => {
          setShowDetailModal(false);
          setSelectedUserDetail(null);
        }}
        title="Chi tiết người dùng"
        size="xlarge"
        closeOnOverlayClick={true}
        className="max-h-[105vh] overflow-y-auto"
        zIndex={60}
      >
        <ModalBody className="max-h-[calc(105vh-200px)] overflow-y-auto">
          {selectedUserDetail && (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <p className="text-sm text-gray-900">{selectedUserDetail.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CCCD/CMND</label>
                    <p className="text-sm text-gray-900">{selectedUserDetail.identification}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedUserDetail.dob)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <p className="text-sm text-gray-900">
                      {selectedUserDetail.gender?.toLowerCase() === 'male' ? 'Nam' :
                       selectedUserDetail.gender?.toLowerCase() === 'female' ? 'Nữ' : 'Khác'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedUserDetail.email}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin sinh viên */}
              {(selectedUserDetail.mssv || selectedUserDetail.school) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin sinh viên</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">MSSV</label>
                      <p className="text-sm text-gray-900">{selectedUserDetail.mssv || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trường</label>
                      <p className="text-sm text-gray-900">{selectedUserDetail.school || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin phòng */}
              {selectedUserDetail.roomNumber && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin phòng ở</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng</label>
                      <p className="text-sm text-gray-900">{selectedUserDetail.roomNumber}</p>
                    </div>
                    {selectedUserDetail.slotNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí giường</label>
                        <p className="text-sm text-gray-900">{selectedUserDetail.slotNumber}</p>
                      </div>
                    )}
                    {selectedUserDetail.registerDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đăng ký</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUserDetail.registerDate)}</p>
                      </div>
                    )}
                    {selectedUserDetail.approvedDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày duyệt</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUserDetail.approvedDate)}</p>
                      </div>
                    )}
                    {selectedUserDetail.duration && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn ở</label>
                        <p className="text-sm text-gray-900">{selectedUserDetail.duration} tháng</p>
                      </div>
                    )}
                    {selectedUserDetail.endDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedUserDetail.endDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ảnh đính kèm */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ảnh đính kèm</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh CCCD mặt trước</label>
                    <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                      <img
                        src={selectedUserDetail.frontIdentificationImage || defaultIdCard}
                        alt="CCCD mặt trước"
                        className="w-full h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const imageUrl = selectedUserDetail.frontIdentificationImage || defaultIdCard;
                          window.open(imageUrl, '_blank');
                        }}
                        onError={(e) => {
                          console.error('Error loading CCCD image:', selectedUserDetail.frontIdentificationImage);
                          e.target.src = defaultIdCard;
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh 3x4</label>
                    <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                      <img
                        src={selectedUserDetail.avatar || defaultAvatar}
                        alt="Ảnh 3x4"
                        className="w-full h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const imageUrl = selectedUserDetail.avatar || defaultAvatar;
                          window.open(imageUrl, '_blank');
                        }}
                        onError={(e) => {
                          console.error('Error loading avatar:', selectedUserDetail.avatar);
                          e.target.src = defaultAvatar;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
      </BaseModal>

      <RejectionModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        onConfirm={handleConfirmLock}
        title="Nhập lý do khóa tài khoản"
        selectedItems={currentUsers.filter(u => selectedUsers.includes(u.id)).map(u => ({
          id: u.id,
          studentName: u.name,
          mssv: u.mssv,
          studentIdNumber: u.identification,
          studentEmail: u.email
        }))}
        onViewDetail={(item) => {
          const user = currentUsers.find(u => u.id === item.id);
          if (user) {
            handleViewDetail(user);
          }
        }}
        onRemoveItem={(itemId) => {
          setSelectedUsers(prev => {
            const newSelection = prev.filter(id => id !== itemId);
            if (newSelection.length === 0) {
              setShowLockModal(false);
            }
            return newSelection;
          });
        }}
      />
    </PageLayout>
  );
};

export default UserManagementPage;

