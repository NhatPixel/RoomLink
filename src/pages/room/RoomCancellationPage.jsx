import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const RoomCancellation = ({ onSuccess, onCancel }) => {
  try {
    return <RoomCancellationContent onSuccess={onSuccess} onCancel={onCancel} />;
  } catch (error) {
    console.error('RoomCancellation error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">Không thể tải trang hủy phòng</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
          >
            Tải lại trang
          </Button>
        </div>
      </div>
    );
  }
};

const RoomCancellationContent = ({ onSuccess, onCancel }) => {
  const [currentContract, setCurrentContract] = useState(null);
  const [showCancellationForm, setShowCancellationForm] = useState(false);
  const [cancellationForm, setCancellationForm] = useState({
    reason: '',
    expectedMoveOutDate: '',
    additionalNotes: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  console.log('RoomCancellation rendering, user:', user, 'currentContract:', currentContract);

  // Mock current contract data
  const getMockCurrentContract = () => ({
    contractId: 'CT2024001',
    studentId: user?.username || 'student001',
    studentName: user?.name || 'Nguyễn Văn A',
    currentRoom: {
      building: 'A',
      floor: 1,
      roomNumber: '101',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 1,
      monthlyFee: 1500000
    },
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    status: 'active',
    cancellationHistory: []
  });

  // Predefined cancellation reasons
  const cancellationReasons = [
    'Tốt nghiệp',
    'Chuyển trường',
    'Hoàn cảnh gia đình',
    'Sức khỏe',
    'Tài chính',
    'Chuyển về nhà',
    'Lý do cá nhân khác'
  ];

  useEffect(() => {
    // Load current contract information
    const savedContract = localStorage.getItem('roomContract');
    if (savedContract) {
      try {
        const parsedContract = JSON.parse(savedContract);
        setCurrentContract(parsedContract);
      } catch (error) {
        console.error('Error parsing contract data:', error);
        setCurrentContract(getMockCurrentContract());
      }
    } else {
      setCurrentContract(getMockCurrentContract());
    }
  }, [user]);

  // Fallback: Set contract immediately if not set
  useEffect(() => {
    try {
      if (!currentContract) {
        console.log('Setting fallback contract');
        setCurrentContract(getMockCurrentContract());
      }
    } catch (error) {
      console.error('Error in fallback useEffect:', error);
    }
  }, []);

  // Emergency fallback with timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentContract) {
        console.log('Emergency fallback: forcing contract set');
        setCurrentContract(getMockCurrentContract());
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentContract]);

  const handleCancellationRequest = () => {
    setShowCancellationForm(true);
    setError('');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCancellationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!cancellationForm.reason) {
      setError('Vui lòng chọn lý do hủy phòng');
      return false;
    }
    if (!cancellationForm.expectedMoveOutDate) {
      setError('Vui lòng chọn ngày dự kiến trả phòng');
      return false;
    }
    if (!cancellationForm.agreeToTerms) {
      setError('Vui lòng đồng ý với các điều khoản hủy phòng');
      return false;
    }

    // Check if move out date is at least 7 days from now
    const moveOutDate = new Date(cancellationForm.expectedMoveOutDate);
    const today = new Date();
    const daysDifference = Math.ceil((moveOutDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysDifference < 7) {
      setError('Ngày trả phòng phải cách ngày hiện tại ít nhất 7 ngày');
      return false;
    }

    return true;
  };

  const handleSubmitCancellation = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Create cancellation request with full details for admin approval
        const cancellationRequest = {
          id: `CANCEL${Date.now()}`,
          studentId: currentContract.studentId,
          studentName: currentContract.studentName,
          studentEmail: user?.email || 'student@example.com',
          studentPhone: user?.phone || '0123456789',
          studentIdNumber: user?.studentId || '20190001',
          currentRoom: {
            roomNumber: `${currentContract?.currentRoom?.building || 'A'}${currentContract?.currentRoom?.roomNumber || '101'}`,
            building: `Tòa ${currentContract?.currentRoom?.building || 'A'}`,
            zone: `Khu ${currentContract?.currentRoom?.building || 'A'}`,
            roomType: currentContract?.currentRoom?.roomType || 'Phòng đôi',
            monthlyFee: currentContract?.currentRoom?.monthlyFee || 800000
          },
          contract: {
            contractId: currentContract.contractId,
            startDate: currentContract.startDate,
            endDate: currentContract.endDate,
            deposit: currentContract.deposit,
            monthlyFee: currentContract?.currentRoom?.monthlyFee || 800000,
            totalPaid: currentContract.totalPaid || 0,
            remainingAmount: currentContract.remainingAmount || 0
          },
          cancellation: {
            requestDate: new Date().toISOString().split('T')[0],
            reason: cancellationForm.reason,
            expectedMoveOutDate: cancellationForm.expectedMoveOutDate,
            refundAmount: currentContract.remainingAmount || 0,
            penaltyFee: 0, // Calculate based on business rules
            finalRefundAmount: currentContract.remainingAmount || 0
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
          documents: {
            moveOutRequest: true,
            roomConditionReport: false,
            personalReason: cancellationForm.reason === 'Lý do cá nhân',
            graduationCertificate: cancellationForm.reason === 'Tốt nghiệp',
            transferDocument: cancellationForm.reason === 'Chuyển trường',
            healthCertificate: cancellationForm.reason === 'Lý do sức khỏe',
            hometownDocument: cancellationForm.reason === 'Chuyển về quê'
          }
        };

        // Update contract with cancellation request
        const updatedContract = {
          ...currentContract,
          cancellationHistory: [
            ...(currentContract.cancellationHistory || []),
            cancellationRequest
          ],
          status: 'cancellation_requested'
        };

        // Save updated contract
        localStorage.setItem('roomContract', JSON.stringify(updatedContract));
        
        // Save cancellation request separately
        const existingRequests = JSON.parse(localStorage.getItem('cancellationRequests') || '[]');
        existingRequests.push(cancellationRequest);
        localStorage.setItem('cancellationRequests', JSON.stringify(existingRequests));
        
        // Simulate sending email notification
        console.log(`Cancellation request email sent to ${user?.email || 'student@example.com'}`);
        
        setIsLoading(false);
        setIsSubmitting(false);
        
        // Show success message
        alert(`Đơn yêu cầu hủy phòng đã được gửi thành công!\nMã đơn: ${cancellationRequest.id}\nTrạng thái: Chờ duyệt\nEmail xác nhận đã được gửi đến ${user?.email || 'email của bạn'}`);
        
        if (onSuccess) {
          onSuccess(updatedContract);
        }
      } catch (err) {
        setError('Gửi đơn yêu cầu hủy phòng không thành công, vui lòng thử lại');
        setIsLoading(false);
        setIsSubmitting(false);
      }
    }, 2000);
  };

  const handleBackToContract = () => {
    setShowCancellationForm(false);
    setCancellationForm({
      reason: '',
      expectedMoveOutDate: '',
      additionalNotes: '',
      agreeToTerms: false
    });
    setError('');
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

  const getMinMoveOutDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 7); // Minimum 7 days from now
    return minDate.toISOString().split('T')[0];
  };

  const getMaxMoveOutDate = () => {
    const contractEndDate = new Date(currentContract?.endDate || '2024-07-15');
    return contractEndDate.toISOString().split('T')[0];
  };

  if (!currentContract) {
    console.log('RoomCancellation: No contract, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin hợp đồng...</p>
          <p className="text-sm text-gray-500 mt-2">User: {user ? user.username : 'Not loaded'}</p>
        </div>
      </div>
    );
  }

  if (showCancellationForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Yêu cầu hủy phòng</h1>
            <p className="mt-2 text-gray-600">Điền thông tin để gửi đơn yêu cầu hủy phòng</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Contract Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin phòng hiện tại</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Mã hợp đồng</label>
                    <p className="text-lg font-semibold text-gray-900">{currentContract.contractId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phòng hiện tại</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {currentContract?.currentRoom?.building || 'N/A'}{currentContract?.currentRoom?.roomNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                    <p className="text-lg font-semibold text-gray-900">{currentContract?.currentRoom?.roomType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phí hàng tháng</label>
                    <p className="text-lg font-semibold text-green-600">{formatPrice(currentContract?.currentRoom?.monthlyFee || 0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(currentContract.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                    <p className="text-lg font-semibold text-gray-900">{formatDate(currentContract.endDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin hủy phòng</h2>
              
              <form className="space-y-6">
                {/* Reason */}
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hủy phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    value={cancellationForm.reason}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn lý do hủy phòng</option>
                    {cancellationReasons.map((reason, index) => (
                      <option key={index} value={reason}>{reason}</option>
                    ))}
                  </select>
                </div>

                {/* Expected Move Out Date */}
                <div>
                  <label htmlFor="expectedMoveOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày dự kiến trả phòng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expectedMoveOutDate"
                    name="expectedMoveOutDate"
                    value={cancellationForm.expectedMoveOutDate}
                    onChange={handleFormChange}
                    min={getMinMoveOutDate()}
                    max={getMaxMoveOutDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ngày trả phòng phải cách ngày hiện tại ít nhất 7 ngày
                  </p>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thêm (tùy chọn)
                  </label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    rows={4}
                    value={cancellationForm.additionalNotes}
                    onChange={handleFormChange}
                    placeholder="Mô tả chi tiết lý do hủy phòng hoặc các yêu cầu đặc biệt..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={cancellationForm.agreeToTerms}
                      onChange={handleFormChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                      Tôi đồng ý với các điều khoản hủy phòng <span className="text-red-500">*</span>
                    </label>
                    <p className="text-gray-500">
                      Tôi hiểu rằng việc hủy phòng có thể phải chịu phí hủy và cần được phê duyệt từ quản lý KTX.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBackToContract}
                    disabled={isLoading}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleSubmitCancellation}
                    loading={isLoading}
                    loadingText="Đang gửi đơn..."
                  >
                    Gửi đơn yêu cầu hủy phòng
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Cancellation Terms */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">Điều khoản hủy phòng</h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>• Đơn yêu cầu hủy phòng cần được gửi trước ít nhất 7 ngày so với ngày dự kiến trả phòng</p>
              <p>• Phí hủy phòng có thể được áp dụng tùy theo thời điểm hủy và điều khoản hợp đồng</p>
              <p>• Đơn yêu cầu sẽ được xem xét và phê duyệt bởi quản lý KTX trong vòng 3-5 ngày làm việc</p>
              <p>• Sau khi được phê duyệt, sinh viên cần hoàn tất thủ tục trả phòng và thanh toán các khoản phí còn lại</p>
              <p>• Email xác nhận sẽ được gửi đến địa chỉ email đã đăng ký</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hủy phòng ở KTX</h1>
          <p className="mt-2 text-gray-600">Gửi đơn yêu cầu hủy phòng và trả phòng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Contract Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin phòng hiện tại</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã hợp đồng</label>
                  <p className="text-lg font-semibold text-gray-900">{currentContract.contractId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng hiện tại</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentContract?.currentRoom?.building || 'N/A'}{currentContract?.currentRoom?.roomNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                  <p className="text-lg font-semibold text-gray-900">{currentContract?.currentRoom?.roomType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tòa</label>
                  <p className="text-lg font-semibold text-gray-900">{currentContract?.currentRoom?.building || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tầng</label>
                  <p className="text-lg font-semibold text-gray-900">{currentContract?.currentRoom?.floor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sức chứa</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentContract?.currentRoom?.currentOccupancy || 0}/{currentContract?.currentRoom?.capacity || 0}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(currentContract.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(currentContract.endDate)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Phí hàng tháng</label>
                <p className="text-2xl font-bold text-green-600">{formatPrice(currentContract?.currentRoom?.monthlyFee || 0)}</p>
              </div>
            </div>
          </div>

          {/* Cancellation Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin hủy phòng</h2>
            
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Lưu ý quan trọng:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Việc hủy phòng cần được thực hiện trước ít nhất 7 ngày</li>
                  <li>• Phí hủy phòng có thể được áp dụng tùy theo thời điểm</li>
                  <li>• Đơn yêu cầu cần được phê duyệt từ quản lý KTX</li>
                  <li>• Email xác nhận sẽ được gửi sau khi gửi đơn thành công</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Quy trình hủy phòng:</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Điền thông tin yêu cầu hủy phòng</li>
                  <li>2. Chọn ngày dự kiến trả phòng</li>
                  <li>3. Gửi đơn yêu cầu và chờ phê duyệt</li>
                  <li>4. Nhận email xác nhận và hoàn tất thủ tục</li>
                </ol>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Hủy
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancellationRequest}
                >
                  Yêu cầu trả phòng
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation History */}
        {currentContract.cancellationHistory && currentContract.cancellationHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử yêu cầu hủy phòng</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã đơn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày gửi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày trả phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentContract.cancellationHistory.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(request.expectedMoveOutDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'approved' ? 'Đã duyệt' :
                           request.status === 'rejected' ? 'Từ chối' :
                           'Chờ duyệt'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCancellation;
