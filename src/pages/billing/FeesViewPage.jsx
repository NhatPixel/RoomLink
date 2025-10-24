import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const FeesView = ({ onSuccess, onCancel }) => {
  const [fees, setFees] = useState([]);
  const [filteredFees, setFilteredFees] = useState([]);
  const [paginatedFees, setPaginatedFees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [filter, setFilter] = useState('all'); // all, paid, unpaid
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Mock fees data
  const mockFees = [
    {
      id: 'FEE001',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'accommodation',
      feeTypeName: 'Phí ở KTX',
      period: 'Tháng 1/2024',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 1500000,
      status: 'paid',
      paidDate: '2024-01-10',
      paymentMethod: 'Chuyển khoản',
      description: 'Phí ở KTX tháng 1/2024 - Phòng đôi',
      details: {
        roomFee: 1500000,
        serviceFee: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 1500000
      }
    },
    {
      id: 'FEE002',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'cleaning',
      feeTypeName: 'Phí vệ sinh',
      period: 'Tháng 1/2024',
      issueDate: '2024-01-01',
      dueDate: '2024-01-15',
      amount: 100000,
      status: 'paid',
      paidDate: '2024-01-12',
      paymentMethod: 'Tiền mặt',
      description: 'Phí vệ sinh chung tháng 1/2024',
      details: {
        roomFee: 0,
        serviceFee: 100000,
        lateFee: 0,
        discount: 0,
        totalAmount: 100000
      }
    },
    {
      id: 'FEE003',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'accommodation',
      feeTypeName: 'Phí ở KTX',
      period: 'Tháng 2/2024',
      issueDate: '2024-02-01',
      dueDate: '2024-02-15',
      amount: 1500000,
      status: 'unpaid',
      paidDate: null,
      paymentMethod: null,
      description: 'Phí ở KTX tháng 2/2024 - Phòng đôi',
      details: {
        roomFee: 1500000,
        serviceFee: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 1500000
      }
    },
    {
      id: 'FEE004',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'cleaning',
      feeTypeName: 'Phí vệ sinh',
      period: 'Tháng 2/2024',
      issueDate: '2024-02-01',
      dueDate: '2024-02-15',
      amount: 100000,
      status: 'unpaid',
      paidDate: null,
      paymentMethod: null,
      description: 'Phí vệ sinh chung tháng 2/2024',
      details: {
        roomFee: 0,
        serviceFee: 100000,
        lateFee: 0,
        discount: 0,
        totalAmount: 100000
      }
    },
    {
      id: 'FEE005',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'accommodation',
      feeTypeName: 'Phí ở KTX',
      period: 'Tháng 3/2024',
      issueDate: '2024-03-01',
      dueDate: '2024-03-15',
      amount: 1500000,
      status: 'paid',
      paidDate: '2024-03-08',
      paymentMethod: 'Chuyển khoản',
      description: 'Phí ở KTX tháng 3/2024 - Phòng đôi',
      details: {
        roomFee: 1500000,
        serviceFee: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 1500000
      }
    },
    {
      id: 'FEE006',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'cleaning',
      feeTypeName: 'Phí vệ sinh',
      period: 'Tháng 3/2024',
      issueDate: '2024-03-01',
      dueDate: '2024-03-15',
      amount: 100000,
      status: 'paid',
      paidDate: '2024-03-10',
      paymentMethod: 'Chuyển khoản',
      description: 'Phí vệ sinh chung tháng 3/2024',
      details: {
        roomFee: 0,
        serviceFee: 100000,
        lateFee: 0,
        discount: 0,
        totalAmount: 100000
      }
    },
    {
      id: 'FEE007',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'security',
      feeTypeName: 'Phí bảo vệ',
      period: 'Tháng 3/2024',
      issueDate: '2024-03-01',
      dueDate: '2024-03-15',
      amount: 50000,
      status: 'paid',
      paidDate: '2024-03-12',
      paymentMethod: 'Tiền mặt',
      description: 'Phí bảo vệ an ninh tháng 3/2024',
      details: {
        roomFee: 0,
        serviceFee: 50000,
        lateFee: 0,
        discount: 0,
        totalAmount: 50000
      }
    },
    {
      id: 'FEE008',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'accommodation',
      feeTypeName: 'Phí ở KTX',
      period: 'Tháng 4/2024',
      issueDate: '2024-04-01',
      dueDate: '2024-04-15',
      amount: 1500000,
      status: 'unpaid',
      paidDate: null,
      paymentMethod: null,
      description: 'Phí ở KTX tháng 4/2024 - Phòng đôi',
      details: {
        roomFee: 1500000,
        serviceFee: 0,
        lateFee: 0,
        discount: 0,
        totalAmount: 1500000
      }
    },
    {
      id: 'FEE009',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'cleaning',
      feeTypeName: 'Phí vệ sinh',
      period: 'Tháng 4/2024',
      issueDate: '2024-04-01',
      dueDate: '2024-04-15',
      amount: 100000,
      status: 'unpaid',
      paidDate: null,
      paymentMethod: null,
      description: 'Phí vệ sinh chung tháng 4/2024',
      details: {
        roomFee: 0,
        serviceFee: 100000,
        lateFee: 0,
        discount: 0,
        totalAmount: 100000
      }
    },
    {
      id: 'FEE010',
      contractId: 'CT2024001',
      studentId: user?.username || 'student001',
      studentName: user?.name || 'Nguyễn Văn A',
      roomNumber: 'A101',
      feeType: 'late',
      feeTypeName: 'Phí trễ hạn',
      period: 'Tháng 2/2024',
      issueDate: '2024-02-16',
      dueDate: '2024-02-20',
      amount: 50000,
      status: 'unpaid',
      paidDate: null,
      paymentMethod: null,
      description: 'Phí trễ hạn thanh toán tháng 2/2024',
      details: {
        roomFee: 0,
        serviceFee: 0,
        lateFee: 50000,
        discount: 0,
        totalAmount: 50000
      }
    }
  ];

  useEffect(() => {
    // Load fees data
    const savedFees = localStorage.getItem('studentFees');
    if (savedFees) {
      try {
        const parsedFees = JSON.parse(savedFees);
        setFees(parsedFees);
      } catch (error) {
        console.error('Error parsing fees data:', error);
        setFees(mockFees);
      }
    } else {
      setFees(mockFees);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    // Filter fees based on selected filter
    let filtered = fees;
    if (filter === 'paid') {
      filtered = fees.filter(fee => fee.status === 'paid');
    } else if (filter === 'unpaid') {
      filtered = fees.filter(fee => fee.status === 'unpaid');
    }
    setFilteredFees(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [fees, filter]);

  useEffect(() => {
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedFees(filteredFees.slice(startIndex, endIndex));
  }, [filteredFees, currentPage, itemsPerPage]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'unpaid':
        return 'Chưa thanh toán';
      default:
        return 'Không xác định';
    }
  };

  const getFeeTypeIcon = (feeType) => {
    switch (feeType) {
      case 'accommodation':
        return '🏠';
      case 'cleaning':
        return '🧹';
      case 'security':
        return '🛡️';
      case 'late':
        return '⏰';
      default:
        return '💰';
    }
  };

  const getTotalAmount = () => {
    return fees.reduce((total, fee) => total + fee.amount, 0);
  };

  const getPaidAmount = () => {
    return fees.filter(fee => fee.status === 'paid').reduce((total, fee) => total + fee.amount, 0);
  };

  const getUnpaidAmount = () => {
    return fees.filter(fee => fee.status === 'unpaid').reduce((total, fee) => total + fee.amount, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải hóa đơn lệ phí...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hóa đơn lệ phí ở KTX</h1>
          <p className="mt-2 text-gray-600">Xem chi tiết các khoản lệ phí trong ký túc xá</p>
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
                <p className="text-sm font-medium text-gray-500">Tổng số hóa đơn</p>
                <p className="text-2xl font-semibold text-gray-900">{fees.length}</p>
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
              Tất cả ({fees.length})
            </button>
            <button
              onClick={() => handleFilterChange('paid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã thanh toán ({fees.filter(fee => fee.status === 'paid').length})
            </button>
            <button
              onClick={() => handleFilterChange('unpaid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'unpaid'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa thanh toán ({fees.filter(fee => fee.status === 'unpaid').length})
            </button>
          </div>
        </div>

        {/* Fees List */}
        {filteredFees.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Hiện tại chưa có hóa đơn nào
            </h3>
            <p className="text-gray-500">
              Hóa đơn lệ phí sẽ được tạo hàng tháng và hiển thị tại đây
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedFees.map((fee) => (
                <div key={fee.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Fee Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getFeeTypeIcon(fee.feeType)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{fee.feeTypeName}</h3>
                          <p className="text-sm text-gray-600">{fee.period}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                        {getStatusText(fee.status)}
                      </span>
                    </div>

                    {/* Fee Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mã hóa đơn:</span>
                        <span className="font-medium">{fee.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Phòng:</span>
                        <span className="font-medium">{fee.roomNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ngày phát hành:</span>
                        <span className="font-medium">{formatDate(fee.issueDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Hạn thanh toán:</span>
                        <span className="font-medium">{formatDate(fee.dueDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Loại phí:</span>
                        <span className="font-medium">{fee.feeTypeName}</span>
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="border-t pt-4 mb-4">
                      <div className="space-y-2 text-sm">
                        {fee.details.roomFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phí ở:</span>
                            <span className="font-medium">{formatPrice(fee.details.roomFee)}</span>
                          </div>
                        )}
                        {fee.details.serviceFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phí dịch vụ:</span>
                            <span className="font-medium">{formatPrice(fee.details.serviceFee)}</span>
                          </div>
                        )}
                        {fee.details.lateFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Phí trễ hạn:</span>
                            <span className="font-medium text-red-600">{formatPrice(fee.details.lateFee)}</span>
                          </div>
                        )}
                        {fee.details.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Giảm giá:</span>
                            <span className="font-medium text-green-600">-{formatPrice(fee.details.discount)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Tổng tiền:</span>
                        <span className="text-xl font-bold text-gray-900">{formatPrice(fee.amount)}</span>
                      </div>
                    </div>

                    {/* Payment Info (if paid) */}
                    {fee.status === 'paid' && (
                      <div className="mt-4 p-3 bg-green-50 rounded-md">
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Ngày thanh toán:</span>
                          <span className="font-medium text-green-800">{formatDate(fee.paidDate)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Phương thức:</span>
                          <span className="font-medium text-green-800">{fee.paymentMethod}</span>
                        </div>
                      </div>
                    )}

                    {/* Overdue Warning (if unpaid and overdue) */}
                    {fee.status === 'unpaid' && new Date(fee.dueDate) < new Date() && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md">
                        <div className="flex items-center">
                          <span className="text-red-600 text-sm font-medium">⚠️ Quá hạn thanh toán</span>
                        </div>
                      </div>
                    )}

                    {/* Payment Button (if unpaid) */}
                    {fee.status === 'unpaid' && (
                      <div className="mt-4">
                        <Button
                          variant="success"
                          size="small"
                          fullWidth
                          onClick={() => {
                            const url = `/payment?billId=${fee.id}&type=fees`;
                            window.location.href = url;
                          }}
                          icon="💳"
                        >
                          Thanh toán ngay
                        </Button>
                      </div>
                    )}

                    {/* Description */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600">{fee.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredFees.length > itemsPerPage && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredFees.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredFees.length}
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

export default FeesView;
