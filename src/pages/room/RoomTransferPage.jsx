import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import InfoBox from '../../components/ui/InfoBox';
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
  const [availableRooms, setAvailableRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(6); // Default 6 months
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [roomTypes, setRoomTypes] = useState([]);
  const [filters, setFilters] = useState({
    roomTypeId: '',
    status: 'available'
  });
  const [filteredRooms, setFilteredRooms] = useState([]);

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

  // Fetch room types
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await roomApi.getRoomType();
        if (response.success && response.data) {
          setRoomTypes(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  // Fetch available rooms when showing room selection
  useEffect(() => {
    if (showRoomSelection && filters.roomTypeId) {
      fetchAvailableRooms();
    }
  }, [showRoomSelection, filters.roomTypeId]);

  const fetchAvailableRooms = async () => {
    try {
      setRoomsLoading(true);
      const response = await roomApi.getRoom({
        roomTypeId: filters.roomTypeId
      });
      
      if (response.success && response.data) {
        // Transform API response
        const transformed = response.data.map(room => {
          const availableSlots = room.roomSlots?.filter(slot => !slot.isOccupied) || [];
          const occupiedSlots = room.roomSlots?.filter(slot => slot.isOccupied) || [];
          
          return {
            id: room.id,
            roomNumber: room.roomNumber,
            roomType: room.roomType_type || 'N/A',
            roomTypeId: room.roomTypeId,
            monthlyFee: room.monthlyFee,
            capacity: room.capacity,
            floor: room.floor_number || 0,
            amenities: room.roomType_amenities || [],
            status: availableSlots.length > 0 ? 'available' : 'occupied',
            availableSlots: availableSlots,
            occupiedSlots: occupiedSlots,
            totalSlots: room.roomSlots?.length || 0,
            currentOccupancy: occupiedSlots.length
          };
        });

        // Filter out current room
        const filtered = transformed.filter(room => {
          if (!roomData) return true;
          return room.roomNumber !== roomData.roomNumber;
        });

        setAvailableRooms(filtered);
        setFilteredRooms(filtered);
      }
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      showError('Không thể tải danh sách phòng. Vui lòng thử lại.');
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    // Calculate pagination for filtered rooms
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredRooms(availableRooms.slice(startIndex, endIndex));
  }, [availableRooms, currentPage, itemsPerPage]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleTransferRequest = () => {
    if (!roomData) {
      showError('Không tìm thấy thông tin phòng.');
      return;
    }
    setShowRoomSelection(true);
    setError('');
  };

  const handleRoomSelect = (room) => {
    // Check if selected room is the same as current room
    if (room.roomNumber === roomData?.roomNumber) {
      setError('Phòng bạn chọn trùng với phòng hiện tại. Vui lòng chọn phòng khác.');
      return;
    }

    // Check if room has available slots
    if (room.status !== 'available' || room.availableSlots.length === 0) {
      setError('Phòng hiện tại đã đủ người, vui lòng chọn phòng khác.');
      return;
    }

    // If only one slot available, auto-select it
    if (room.availableSlots.length === 1) {
      setSelectedSlot(room.availableSlots[0]);
    }

    setSelectedRoom(room);
    setError('');
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleTransferConfirm = async () => {
    if (!selectedRoom) {
      setError('Vui lòng chọn phòng để chuyển');
      return;
    }

    if (!selectedSlot) {
      setError('Vui lòng chọn vị trí giường trong phòng');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Gọi API để yêu cầu chuyển phòng
      const response = await roomRegistrationApi.requestRoomMove({
        roomSlotId: selectedSlot.id,
        duration: duration
      });

      if (response.success) {
        showSuccess(`Đơn yêu cầu chuyển phòng đã được gửi thành công! Từ phòng: ${roomData?.roomNumber} → Đến phòng: ${selectedRoom.roomNumber}, vị trí giường ${selectedSlot.slotNumber}. Đơn sẽ được xem xét và duyệt bởi quản trị viên.`);
        
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
    setSelectedRoom(null);
    setSelectedSlot(null);
    setError('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatPrice = (price) => {
    if (!price) return '-';
    const numAmount = parseFloat(price) * 1000;
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

  const getRoomStatusColor = (room) => {
    if (room.status === 'occupied' || room.availableSlots.length === 0) {
      return 'bg-red-100 text-red-800';
    } else if (room.currentOccupancy > 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getRoomStatusText = (room) => {
    if (room.status === 'occupied' || room.availableSlots.length === 0) {
      return 'Đã đủ người';
    } else if (room.currentOccupancy > 0) {
      return `Còn ${room.availableSlots.length} chỗ`;
    } else {
      return 'Còn trống';
    }
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
    const totalPages = Math.ceil(availableRooms.length / itemsPerPage);
    const paginatedRooms = availableRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Chọn phòng mới</h1>
            <p className="mt-2 text-gray-600">Chọn phòng bạn muốn chuyển đến</p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Phòng hiện tại:</span> {roomData.roomNumber} ({roomData.roomType?.type || 'N/A'})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
                
                <div className="space-y-4">
                  {/* Room Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại phòng
                    </label>
                    <select
                      value={filters.roomTypeId}
                      onChange={(e) => handleFilterChange('roomTypeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Chọn loại phòng</option>
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời hạn thuê (tháng)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={3}>3 tháng</option>
                      <option value={6}>6 tháng</option>
                      <option value={12}>12 tháng</option>
                      <option value={24}>24 tháng</option>
                    </select>
                  </div>
                </div>

                {!filters.roomTypeId && (
                  <InfoBox
                    type="info"
                    messages={['Vui lòng chọn loại phòng để xem danh sách phòng có sẵn.']}
                    className="mt-4"
                  />
                )}
              </div>
            </div>

            {/* Room List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Danh sách phòng ({availableRooms.length} phòng)
                    </h3>
                    {selectedRoom && (
                      <div className="text-sm text-blue-600 font-medium">
                        Đã chọn: {selectedRoom.roomNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {roomsLoading ? (
                    <LoadingState isLoading={true} loadingText="Đang tải danh sách phòng..." className="py-12" />
                  ) : availableRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🏠</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filters.roomTypeId ? 'Không tìm thấy phòng phù hợp' : 'Vui lòng chọn loại phòng'}
                      </h3>
                      <p className="text-gray-500">
                        {filters.roomTypeId ? 'Hãy thử thay đổi bộ lọc để tìm phòng khác' : 'Chọn loại phòng ở bộ lọc bên trái để xem danh sách phòng có sẵn'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {paginatedRooms.map((room) => (
                        <div
                          key={room.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedRoom?.id === room.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          } ${
                            room.status === 'occupied' || room.availableSlots.length === 0
                              ? 'opacity-60 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => handleRoomSelect(room)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {room.roomNumber}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Tầng {room.floor}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room)}`}>
                              {getRoomStatusText(room)}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Loại phòng:</span>
                              <span className="font-medium">{room.roomType}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Sức chứa:</span>
                              <span className="font-medium">{room.currentOccupancy}/{room.capacity} người</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Giá thuê:</span>
                              <span className="font-medium text-green-600">{formatPrice(room.monthlyFee)}/tháng</span>
                            </div>
                          </div>

                          {room.amenities && room.amenities.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">Tiện nghi:</p>
                              <div className="flex flex-wrap gap-1">
                                {room.amenities.map((amenity, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                  >
                                    {amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedRoom?.id === room.id && room.availableSlots.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">Chọn vị trí giường:</p>
                              <div className="grid grid-cols-3 gap-2">
                                {room.availableSlots.map((slot) => (
                                  <button
                                    key={slot.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSlotSelect(slot);
                                    }}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                      selectedSlot?.id === slot.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Giường {slot.slotNumber}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {availableRooms.length > itemsPerPage && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={availableRooms.length}
              />
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBackToContract}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            
            {selectedRoom && selectedSlot && (
              <Button
                variant="success"
                onClick={handleTransferConfirm}
                loading={isSubmitting}
                loadingText="Đang gửi đơn..."
              >
                Xác nhận chuyển đến {selectedRoom.roomNumber} - Giường {selectedSlot.slotNumber}
              </Button>
            )}
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
