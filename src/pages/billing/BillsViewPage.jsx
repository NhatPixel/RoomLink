import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { paymentApi, roomApi } from '../../api';
import {
  transformPaymentToBill,
  getPaymentTypeName,
  getPaymentTypeIcon,
  getPaymentStatusName,
  getPaymentStatusColor,
  isPaymentPaid,
  PAYMENT_TYPES
} from '../../utils/paymentUtils';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const BillsView = ({ onSuccess, onCancel }) => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [paginatedBills, setPaginatedBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filter, setFilter] = useState('all'); // all, paid, unpaid
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [processingPaymentId, setProcessingPaymentId] = useState(null);

  useEffect(() => {
    const loadBills = async () => {
      try {
        setIsLoading(true);
        console.log('Loading bills for user:', user?.id);
        
        // Load room data to get roomNumber
        let roomNumber = 'N/A';
        try {
          const roomResponse = await roomApi.getRoomByUser();
          console.log('Room response:', roomResponse);
          if (roomResponse.success && roomResponse.data) {
            roomNumber = roomResponse.data.roomNumber || 'N/A';
          }
        } catch (roomError) {
          console.error('Error loading room data:', roomError);
          // Continue without room number
        }

        // Load payments - get all payments for user
        // Payment types: "ROOM", "REFUND", "ELECTRICITY", "WATER", "HEALTHCHECK"
        console.log('Calling paymentApi.getPaymentByUserId with userId:', user?.id);
        const paymentResponse = await paymentApi.getPaymentByUserId({
          userId: user?.id,
          page: 1,
          limit: 1000 // Get all payments
        });

        console.log('Payment response:', paymentResponse);

        // Get all payments (no filter)
        // Response structure from ApiResponse: { data: [...payments], pagination: {...} }
        // axiosClient may unwrap response.data, so check both structures
        const allPayments = Array.isArray(paymentResponse.data) 
          ? paymentResponse.data 
          : (paymentResponse.data?.data || paymentResponse.data?.response || []);

        console.log('All payments:', allPayments);

        // Transform payments to bills
        const transformedBills = allPayments.map(payment => 
          transformPaymentToBill(payment, roomNumber, user?.name || '')
        );

        // Sort by issueDate descending (newest first)
        transformedBills.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

        console.log('Transformed bills:', transformedBills);
        setBills(transformedBills);
      } catch (error) {
        console.error('Error loading bills:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách hóa đơn.';
        showError(errorMessage);
        setBills([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Wait for auth to finish loading and user to be available
    if (!authLoading) {
      if (user?.id) {
        loadBills();
      } else {
        console.log('No user ID available, skipping loadBills');
        setIsLoading(false);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    // Filter bills based on selected filter
    let filtered = bills;
    if (filter === 'paid') {
      filtered = bills.filter(bill => isPaymentPaid(bill.paymentStatus));
    } else if (filter === 'unpaid') {
      filtered = bills.filter(bill => !isPaymentPaid(bill.paymentStatus));
    }
    setFilteredBills(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [bills, filter]);

  useEffect(() => {
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedBills(filteredBills.slice(startIndex, endIndex));
  }, [filteredBills, currentPage, itemsPerPage]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };


  const getTotalAmount = () => {
    return bills.reduce((total, bill) => total + bill.amount, 0);
  };

  const getPaidAmount = () => {
    return bills.filter(bill => isPaymentPaid(bill.paymentStatus)).reduce((total, bill) => total + bill.amount, 0);
  };

  const getUnpaidAmount = () => {
    return bills.filter(bill => !isPaymentPaid(bill.paymentStatus)).reduce((total, bill) => total + bill.amount, 0);
  };

  const handlePayment = async (paymentId) => {
    try {
      setProcessingPaymentId(paymentId);
      
      // Call API to get payment URL
      const response = await paymentApi.getPaymentUrl({
        paymentId: paymentId
      });

      // Response structure: { data: { paymentUrl: "..." } }
      const paymentUrl = response.data?.paymentUrl || response.data?.data?.paymentUrl;

      if (paymentUrl && paymentUrl.trim() !== '') {
        // Redirect to payment URL (MoMo)
        window.location.href = paymentUrl;
      } else {
        showError('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
        setProcessingPaymentId(null);
      }
    } catch (error) {
      console.error('Error getting payment URL:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo liên kết thanh toán. Vui lòng thử lại.';
      showError(errorMessage);
      setProcessingPaymentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          <p className="mt-2 text-gray-600">Xem chi tiết tất cả các giao dịch thanh toán của bạn</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tổng số giao dịch</p>
                <p className="text-2xl font-semibold text-gray-900">{bills.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Đã thanh toán</p>
                <p className="text-2xl font-semibold text-green-600">{formatPrice(getPaidAmount())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">⚠️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chưa thanh toán</p>
                <p className="text-2xl font-semibold text-red-600">{formatPrice(getUnpaidAmount())}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({bills.length})
            </button>
            <button
              onClick={() => handleFilterChange('paid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã thanh toán ({bills.filter(bill => isPaymentPaid(bill.paymentStatus)).length})
            </button>
            <button
              onClick={() => handleFilterChange('unpaid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'unpaid'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa thanh toán ({bills.filter(bill => !isPaymentPaid(bill.paymentStatus)).length})
            </button>
          </div>
        </div>

        {/* Bills List */}
        {filteredBills.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hiện tại chưa có giao dịch nào
            </h3>
            <p className="text-gray-500">
              Các giao dịch thanh toán của bạn sẽ được hiển thị tại đây
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBills.map((bill) => (
                <div key={bill.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Bill Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getPaymentTypeIcon(bill.paymentType)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{bill.billTypeName}</h3>
                          <p className="text-sm text-gray-600">{bill.period || bill.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(bill.paymentStatus)}`}>
                        {getPaymentStatusName(bill.paymentStatus)}
                      </span>
                    </div>

                    {/* Bill Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mã hóa đơn:</span>
                        <span className="font-medium">{bill.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phòng:</span>
                        <span className="font-medium">{bill.roomNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ngày phát hành:</span>
                        <span className="font-medium">{formatDate(bill.issueDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hạn thanh toán:</span>
                        <span className="font-medium">{formatDate(bill.dueDate)}</span>
                      </div>
                      {(bill.paymentType === PAYMENT_TYPES.ELECTRICITY || bill.paymentType === PAYMENT_TYPES.WATER) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tiêu thụ:</span>
                          <span className="font-medium">{bill.details.consumption} {bill.paymentType === PAYMENT_TYPES.ELECTRICITY ? 'kWh' : 'm³'}</span>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Tổng tiền:</span>
                        <span className="text-xl font-bold text-gray-900">{formatPrice(bill.amount)}</span>
                      </div>
                    </div>

                    {/* Payment Info (if paid) */}
                    {isPaymentPaid(bill.paymentStatus) && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Ngày thanh toán:</span>
                          <span className="font-medium text-green-800">{formatDate(bill.paidDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Phương thức:</span>
                          <span className="font-medium text-green-800">{bill.paymentMethod}</span>
                        </div>
                      </div>
                    )}

                    {/* Overdue Warning (if unpaid and overdue) */}
                    {!isPaymentPaid(bill.paymentStatus) && new Date(bill.dueDate) < new Date() && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md">
                        <div className="flex items-center">
                          <span className="text-red-600 text-sm font-medium">⚠️ Quá hạn thanh toán</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Button (if unpaid and not REFUND) */}
                    {!isPaymentPaid(bill.paymentStatus) && bill.paymentType !== PAYMENT_TYPES.REFUND && (
                      <div className="mt-4">
                        <Button
                          variant="success"
                          size="small"
                          fullWidth
                          onClick={async () => {
                            await handlePayment(bill.id);
                          }}
                          disabled={processingPaymentId === bill.id}
                          loading={processingPaymentId === bill.id}
                          loadingText="Đang xử lý..."
                          icon="💳"
                        >
                          Thanh toán ngay
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredBills.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredBills.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredBills.length}
                />
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Quay lại
          </Button>
          <div className="flex space-x-4">
            <Button
              variant="primary"
              onClick={() => window.print()}
            >
              In hóa đơn
            </Button>
            <Button
              variant="success"
              onClick={() => {
                // Export to PDF functionality would go here
                alert('Tính năng xuất PDF sẽ được phát triển');
              }}
            >
              Xuất PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsView;
