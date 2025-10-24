import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const RoomExtension = ({ onSuccess, onCancel }) => {
  const [contractInfo, setContractInfo] = useState(null);
  const [selectedExtension, setSelectedExtension] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const { user } = useAuth();

  // Extension options
  const extensionOptions = [
    { value: '1-semester', label: '1 học kỳ', duration: 6, price: 9000000 },
    { value: '1-year', label: '1 năm', duration: 12, price: 18000000 },
    { value: '2-years', label: '2 năm', duration: 24, price: 36000000 },
    { value: 'until-graduation', label: 'Đến khi tốt nghiệp', duration: 36, price: 54000000 }
  ];

  // Mock contract data
  const mockContractData = {
    contractId: 'CT2024001',
    studentId: user?.username || 'student001',
    studentName: user?.name || 'Nguyễn Văn A',
    roomNumber: 'A101',
    roomType: 'Phòng đôi',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    duration: 6, // months
    monthlyFee: 1500000,
    totalPaid: 9000000,
    status: 'active',
    remainingDays: 45,
    extensionHistory: [
      {
        id: 1,
        extensionDate: '2024-01-15',
        duration: 6,
        amount: 9000000,
        status: 'completed'
      }
    ]
  };

  useEffect(() => {
    // Load contract information
    const savedContract = localStorage.getItem('roomContract');
    if (savedContract) {
      try {
        const parsedContract = JSON.parse(savedContract);
        setContractInfo(parsedContract);
      } catch (error) {
        console.error('Error parsing contract data:', error);
        setContractInfo(mockContractData);
      }
    } else {
      setContractInfo(mockContractData);
    }
  }, [user]);

  const handleExtensionSelect = (value) => {
    setSelectedExtension(value);
    setError('');
  };

  const handleExtensionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedExtension) {
      setError('Vui lòng chọn thời gian gia hạn');
      return;
    }

    if (!contractInfo) {
      setError('Thông tin sinh viên không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setIsExtending(true);
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      try {
        const selectedOption = extensionOptions.find(opt => opt.value === selectedExtension);
        
        // Calculate new end date
        const currentEndDate = new Date(contractInfo.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setMonth(newEndDate.getMonth() + selectedOption.duration);

        // Update contract information
        const updatedContract = {
          ...contractInfo,
          endDate: newEndDate.toISOString().split('T')[0],
          duration: contractInfo.duration + selectedOption.duration,
          totalPaid: contractInfo.totalPaid + selectedOption.price,
          remainingDays: contractInfo.remainingDays + (selectedOption.duration * 30),
          extensionHistory: [
            ...contractInfo.extensionHistory,
            {
              id: contractInfo.extensionHistory.length + 1,
              extensionDate: new Date().toISOString().split('T')[0],
              duration: selectedOption.duration,
              amount: selectedOption.price,
              status: 'completed'
            }
          ]
        };

        // Save updated contract
        localStorage.setItem('roomContract', JSON.stringify(updatedContract));
        
        // Create extension request with synchronized data for admin approval
        const extensionRequest = {
          id: Date.now(),
          studentId: user.username,
          studentName: user.name,
          studentEmail: user.email,
          studentPhone: user.phone || 'Chưa cập nhật',
          currentRoom: contractInfo.roomNumber,
          currentBuilding: contractInfo.roomNumber.includes('A') ? 'Tòa A' : contractInfo.roomNumber.includes('B') ? 'Tòa B' : 'Tòa C',
          currentZone: contractInfo.roomNumber.includes('A') ? 'Khu A' : contractInfo.roomNumber.includes('B') ? 'Khu B' : 'Khu C',
          roomType: contractInfo.roomType,
          currentContractEndDate: contractInfo.endDate,
          currentContractId: contractInfo.contractId,
          extensionDuration: selectedOption.duration,
          extensionType: selectedExtension,
          extensionLabel: selectedOption.label,
          newEndDate: newEndDate.toISOString().split('T')[0],
          reason: 'Gia hạn hợp đồng ở KTX',
          requestDate: new Date().toISOString(),
          status: 'pending',
          documents: [
            { name: 'Giấy xác nhận sinh viên', uploaded: true },
            { name: 'CMND/CCCD', uploaded: true },
            { name: 'Giấy tờ khác', uploaded: false }
          ],
          monthlyFee: contractInfo.monthlyFee,
          estimatedFee: selectedOption.price,
          priority: 'normal'
        };

        // Save extension request to localStorage for admin approval
        const existingRequests = JSON.parse(localStorage.getItem('extensionRequests') || '[]');
        existingRequests.push(extensionRequest);
        localStorage.setItem('extensionRequests', JSON.stringify(existingRequests));
        
        // Simulate sending email notification
        console.log(`Extension email sent to ${user?.email || 'student@example.com'}`);
        
        setIsLoading(false);
        setIsExtending(false);
        
        // Show success message
        alert(`Đơn gia hạn đã được gửi thành công!\nThời gian gia hạn: ${selectedOption.label}\nNgày hết hạn mới: ${newEndDate.toLocaleDateString('vi-VN')}\nĐơn của bạn sẽ được xem xét trong vòng 24-48 giờ.\nEmail xác nhận đã được gửi đến ${user?.email || 'email của bạn'}`);
        
        if (onSuccess) {
          onSuccess(updatedContract);
        }
      } catch (err) {
        setError('Gia hạn không thành công vui lòng kiểm tra lại');
        setIsLoading(false);
        setIsExtending(false);
      }
    }, 2000);
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

  const calculateDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (!contractInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin hợp đồng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gia hạn thời gian ở KTX</h1>
          <p className="mt-2 text-gray-600">Gia hạn thời gian ở ký túc xá của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin hợp đồng hiện tại</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã hợp đồng</label>
                  <p className="text-lg font-semibold text-gray-900">{contractInfo.contractId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phòng</label>
                  <p className="text-lg font-semibold text-gray-900">{contractInfo.roomNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                  <p className="text-lg font-semibold text-gray-900">{contractInfo.roomType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phí hàng tháng</label>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(contractInfo.monthlyFee)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(contractInfo.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(contractInfo.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Thời gian còn lại</label>
                  <p className={`text-lg font-semibold ${
                    contractInfo.remainingDays > 30 ? 'text-green-600' : 
                    contractInfo.remainingDays > 7 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {contractInfo.remainingDays} ngày
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    contractInfo.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {contractInfo.status === 'active' ? 'Đang hoạt động' : 'Hết hạn'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium text-gray-500">Tổng đã thanh toán</label>
                <p className="text-2xl font-bold text-green-600">{formatPrice(contractInfo.totalPaid)}</p>
              </div>
            </div>
          </div>

          {/* Extension Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn thời gian gia hạn</h2>
            
            <form onSubmit={handleExtensionSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Thời gian gia hạn
                </label>
                <div className="space-y-3">
                  {extensionOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedExtension === option.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleExtensionSelect(option.value)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{option.label}</h3>
                          <p className="text-sm text-gray-600">{option.duration} tháng</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatPrice(option.price)}</p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(option.price / option.duration)}/tháng
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedExtension && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Thông tin gia hạn</h4>
                  {(() => {
                    const selectedOption = extensionOptions.find(opt => opt.value === selectedExtension);
                    const newEndDate = new Date(contractInfo.endDate);
                    newEndDate.setMonth(newEndDate.getMonth() + selectedOption.duration);
                    
                    return (
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Thời gian gia hạn: {selectedOption.label}</p>
                        <p>• Ngày hết hạn mới: {formatDate(newEndDate.toISOString())}</p>
                        <p>• Số tiền cần thanh toán: <span className="font-bold">{formatPrice(selectedOption.price)}</span></p>
                      </div>
                    );
                  })()}
                </div>
              )}

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
                  variant="success"
                  onClick={handleExtensionSubmit}
                  loading={isLoading}
                  loadingText="Đang gia hạn..."
                  disabled={!selectedExtension}
                >
                  Xác nhận gia hạn
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Extension History */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử gia hạn</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gia hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractInfo.extensionHistory.map((extension) => (
                  <tr key={extension.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(extension.extensionDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {extension.duration} tháng
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(extension.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        extension.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {extension.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomExtension;
