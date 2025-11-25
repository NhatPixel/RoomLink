import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import InfoBox from '../../components/ui/InfoBox';
import RoomSelection from '../../components/room/RoomSelection';
import roomRegistrationApi from '../../api/roomRegistrationApi';
import roomApi from '../../api/roomApi';

const RoomTransfer = ({ onSuccess, onCancel }) => {
  try {
    return <RoomTransferContent onSuccess={onSuccess} onCancel={onCancel} />;
  } catch (error) {
    console.error('RoomTransfer error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">Không thể tải trang chuyển phòng</p>
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

const RoomTransferContent = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState(null); // { room, slotId, duration }
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        const response = await roomApi.getRoomByUser();
        if (response.success && response.data) {
          setRoomData(response.data);
        }
      } catch (err) {
        console.error('Error fetching room data:', err);
        const errorCode = err?.response?.data?.errorCode;
        const statusCode = err?.response?.status;
        const isNotFoundError = statusCode === 404 || errorCode === 'ROOM_REGISTRATION_NOT_FOUND';
        
        if (!isNotFoundError) {
          const errorMessage = err?.response?.data?.message || 'Có lỗi xảy ra khi tải thông tin phòng.';
          showError(errorMessage);
        }
        setRoomData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleTransferRequest = () => {
    if (!roomData) {
      showError('Không tìm thấy thông tin phòng.');
      return;
    }
    setShowRoomSelection(true);
    setError('');
    setSelectedRoomData(null);
  };

  const handleRoomSelected = (data) => {
    // data contains: { room, slotId, duration }
    // Check if selected room is the same as current room
    if (data.room.roomNumber === roomData?.roomNumber) {
      showError('Phòng bạn chọn trùng với phòng hiện tại. Vui lòng chọn phòng khác.');
      return;
    }

    setSelectedRoomData(data);
    setError('');
  };

  const handleBackToRoomSelection = () => {
    setSelectedRoomData(null);
    setError('');
  };

  const handleTransferConfirm = async () => {
    if (!selectedRoomData) {
      setError('Vui lòng chọn phòng để chuyển');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Gọi API để yêu cầu chuyển phòng
      const response = await roomRegistrationApi.requestRoomMove({
        roomSlotId: selectedRoomData.slotId,
        duration: Number(selectedRoomData.duration)
      });

      if (response.success) {
        // Find slot number from room data
        const selectedSlot = selectedRoomData.room.roomSlots?.find(slot => slot.id === selectedRoomData.slotId);
        const slotNumber = selectedSlot?.slotNumber || 'N/A';
        
        showSuccess(`Đơn yêu cầu chuyển phòng đã được gửi thành công! Từ phòng: ${roomData?.roomNumber} → Đến phòng: ${selectedRoomData.room.roomNumber}, vị trí giường ${slotNumber}. Đơn sẽ được xem xét và duyệt bởi quản trị viên.`);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Error submitting transfer request:', err);
      const errorMessage = err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đơn yêu cầu chuyển phòng. Vui lòng thử lại.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToContract = () => {
    setShowRoomSelection(false);
    setSelectedRoomData(null);
    setError('');
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    const numAmount = parseFloat(price);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <LoadingState isLoading={true} loadingText="Đang tải thông tin phòng..." className="py-12" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <InfoBox 
              type="info" 
              messages={['Bạn chưa có thông tin phòng ở để chuyển.']} 
            />
            <div className="mt-4">
              <Button variant="outline" onClick={onCancel}>
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showRoomSelection) {
    // Nếu đã chọn phòng, hiển thị form xác nhận
    if (selectedRoomData) {
      const selectedSlot = selectedRoomData.room.roomSlots?.find(slot => slot.id === selectedRoomData.slotId);
      const slotNumber = selectedSlot?.slotNumber || 'N/A';
      
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleBackToRoomSelection}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  }
                  className="mr-4"
                >
                  Quay lại chọn phòng
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">Xác nhận chuyển phòng</h2>
              </div>

              <div className="space-y-6">
                {/* Thông tin phòng hiện tại */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Phòng hiện tại</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Số phòng:</span>
                      <p className="text-gray-900">{roomData.roomNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Vị trí giường:</span>
                      <p className="text-gray-900">Giường {roomData.mySlotNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Loại phòng:</span>
                      <p className="text-gray-900">{roomData.roomType?.type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phí hàng tháng:</span>
                      <p className="text-gray-900">{formatPrice(roomData.monthlyFee)}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin phòng mới */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Phòng mới</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Số phòng:</span>
                      <p className="text-gray-900">{selectedRoomData.room.roomNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Vị trí giường:</span>
                      <p className="text-gray-900">Giường {slotNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Loại phòng:</span>
                      <p className="text-gray-900">{selectedRoomData.room.roomType_type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phí hàng tháng:</span>
                      <p className="text-gray-900">{formatPrice(selectedRoomData.room.monthlyFee)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Thời hạn thuê:</span>
                      <p className="text-gray-900">{selectedRoomData.duration} tháng</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Chênh lệch phí:</span>
                      <p className={`font-semibold ${
                        (selectedRoomData.room.monthlyFee - roomData.monthlyFee) > 0 ? 'text-red-600' : 
                        (selectedRoomData.room.monthlyFee - roomData.monthlyFee) < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {(selectedRoomData.room.monthlyFee - roomData.monthlyFee) > 0 ? '+' : ''}
                        {formatPrice(selectedRoomData.room.monthlyFee - roomData.monthlyFee)}
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={handleBackToRoomSelection}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleTransferConfirm}
                    loading={isSubmitting}
                    loadingText="Đang gửi đơn..."
                  >
                    Xác nhận chuyển phòng
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Hiển thị RoomSelection component
    return (
      <div>
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Phòng hiện tại:</span> {roomData.roomNumber} ({roomData.roomType?.type || 'N/A'})
          </p>
        </div>
        <RoomSelection
          onRoomSelected={handleRoomSelected}
          onCancel={handleBackToContract}
          excludeRoomNumber={roomData.roomNumber}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chuyển phòng ở KTX</h1>
          <p className="mt-2 text-gray-600">Chuyển từ phòng hiện tại sang phòng khác</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Contract Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin phòng hiện tại</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Số phòng</label>
                  <p className="text-lg font-semibold text-gray-900">{roomData.roomNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số giường</label>
                  <p className="text-lg font-semibold text-gray-900">Giường {roomData.mySlotNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                  <p className="text-lg font-semibold text-gray-900">{roomData.roomType?.type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phí hàng tháng</label>
                  <p className="text-lg font-semibold text-gray-900">{formatPrice(roomData.monthlyFee)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày đăng ký</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(roomData.registerDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(roomData.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chuyển phòng</h2>
            
            <div className="space-y-6">
              <InfoBox
                type="warning"
                title="Lưu ý quan trọng"
                messages={[
                  'Chỉ có thể chuyển đến phòng còn chỗ trống',
                  'Phí phòng có thể thay đổi tùy theo loại phòng',
                  'Thời gian chuyển phòng: 1-2 ngày làm việc',
                  'Email xác nhận sẽ được gửi sau khi chuyển thành công'
                ]}
              />

              <InfoBox
                type="info"
                title="Quy trình chuyển phòng"
                messages={[
                  '1. Chọn phòng muốn chuyển đến',
                  '2. Chọn vị trí giường trong phòng',
                  '3. Chọn thời hạn thuê mới',
                  '4. Xác nhận và chờ phê duyệt từ quản lý KTX'
                ]}
              />

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
                  variant="primary"
                  onClick={handleTransferRequest}
                >
                  Chọn phòng mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTransfer;
