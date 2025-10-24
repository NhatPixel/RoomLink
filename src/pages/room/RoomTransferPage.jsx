import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

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
  const [currentContract, setCurrentContract] = useState(null);
  const [showRoomSelection, setShowRoomSelection] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [paginatedRooms, setPaginatedRooms] = useState([]);
  const [filters, setFilters] = useState({
    zone: '',
    building: '',
    roomType: '',
    priceRange: '',
    status: 'available'
  });
  const [filteredRooms, setFilteredRooms] = useState([]);
  const { user } = useAuth();

  console.log('RoomTransfer rendering, user:', user, 'currentContract:', currentContract);

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
    status: 'active'
  });

  // Mock available rooms data - Mở rộng với nhiều phòng hơn
  const mockAvailableRooms = [
    {
      id: 'A102',
      building: 'A',
      floor: 1,
      roomNumber: '102',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 1,
      monthlyFee: 1500000,
      area: 25,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo'],
      description: 'Phòng đôi rộng rãi, có điều hòa'
    },
    {
      id: 'A103',
      building: 'A',
      floor: 1,
      roomNumber: '103',
      roomType: 'Phòng đơn',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2000000,
      area: 20,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa'],
      description: 'Phòng đơn tiện nghi, yên tĩnh'
    },
    {
      id: 'B201',
      building: 'B',
      floor: 2,
      roomNumber: '201',
      roomType: 'Phòng ba',
      capacity: 3,
      currentOccupancy: 2,
      monthlyFee: 1200000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo'],
      description: 'Phòng ba người, thoáng mát'
    },
    {
      id: 'C301',
      building: 'C',
      floor: 3,
      roomNumber: '301',
      roomType: 'Phòng đôi cao cấp',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 2800000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng'],
      description: 'Phòng đôi cao cấp, đầy đủ tiện nghi'
    },
    {
      id: 'A104',
      building: 'A',
      floor: 1,
      roomNumber: '104',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 2,
      status: 'occupied',
      monthlyFee: 1500000,
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo'],
      description: 'Phòng đôi đã có đủ người'
    },
    // Thêm nhiều phòng hơn để test phân trang
    {
      id: 'A105',
      building: 'A',
      floor: 1,
      roomNumber: '105',
      roomType: 'Phòng đơn cao cấp',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng'],
      description: 'Phòng đơn cao cấp với view đẹp'
    },
    {
      id: 'A201',
      building: 'A',
      floor: 2,
      roomNumber: '201',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 1,
      monthlyFee: 1500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa'],
      description: 'Phòng đôi tầng 2, thoáng mát'
    },
    {
      id: 'A202',
      building: 'A',
      floor: 2,
      roomNumber: '202',
      roomType: 'Phòng ba',
      capacity: 3,
      currentOccupancy: 0,
      monthlyFee: 1200000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo'],
      description: 'Phòng ba người, rộng rãi'
    },
    {
      id: 'A203',
      building: 'A',
      floor: 2,
      roomNumber: '203',
      roomType: 'Phòng đôi cao cấp',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 2800000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng'],
      description: 'Phòng đôi cao cấp tầng 2'
    },
    {
      id: 'B101',
      building: 'B',
      floor: 1,
      roomNumber: '101',
      roomType: 'Phòng đơn',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2000000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa'],
      description: 'Phòng đơn tòa B, yên tĩnh'
    },
    {
      id: 'B102',
      building: 'B',
      floor: 1,
      roomNumber: '102',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 1,
      monthlyFee: 1500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa'],
      description: 'Phòng đôi tòa B, có ban công'
    },
    {
      id: 'B103',
      building: 'B',
      floor: 1,
      roomNumber: '103',
      roomType: 'Phòng ba',
      capacity: 3,
      currentOccupancy: 0,
      monthlyFee: 1200000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo'],
      description: 'Phòng ba người tòa B'
    },
    {
      id: 'B202',
      building: 'B',
      floor: 2,
      roomNumber: '202',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 1500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa'],
      description: 'Phòng đôi tầng 2 tòa B'
    },
    {
      id: 'B203',
      building: 'B',
      floor: 2,
      roomNumber: '203',
      roomType: 'Phòng đơn cao cấp',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng'],
      description: 'Phòng đơn cao cấp tầng 2 tòa B'
    },
    {
      id: 'C101',
      building: 'C',
      floor: 1,
      roomNumber: '101',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 1,
      monthlyFee: 1800000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini'],
      description: 'Phòng đôi tòa C với tủ lạnh mini'
    },
    {
      id: 'C102',
      building: 'C',
      floor: 1,
      roomNumber: '102',
      roomType: 'Phòng đơn',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2200000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini'],
      description: 'Phòng đơn tòa C với tủ lạnh mini'
    },
    {
      id: 'C103',
      building: 'C',
      floor: 1,
      roomNumber: '103',
      roomType: 'Phòng ba',
      capacity: 3,
      currentOccupancy: 0,
      monthlyFee: 1400000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini'],
      description: 'Phòng ba người tòa C với tủ lạnh mini'
    },
    {
      id: 'C201',
      building: 'C',
      floor: 2,
      roomNumber: '201',
      roomType: 'Phòng đôi cao cấp',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 3000000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công'],
      description: 'Phòng đôi cao cấp tầng 2 tòa C'
    },
    {
      id: 'C202',
      building: 'C',
      floor: 2,
      roomNumber: '202',
      roomType: 'Phòng đơn cao cấp',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2600000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công'],
      description: 'Phòng đơn cao cấp tầng 2 tòa C với ban công'
    },
    {
      id: 'D101',
      building: 'D',
      floor: 1,
      roomNumber: '101',
      roomType: 'Phòng đôi',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 1900000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Ban công'],
      description: 'Phòng đôi tòa D với ban công và tủ lạnh mini'
    },
    {
      id: 'D102',
      building: 'D',
      floor: 1,
      roomNumber: '102',
      roomType: 'Phòng đơn',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2300000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công'],
      description: 'Phòng đơn tòa D với ban công và view đẹp'
    },
    {
      id: 'D103',
      building: 'D',
      floor: 1,
      roomNumber: '103',
      roomType: 'Phòng ba',
      capacity: 3,
      currentOccupancy: 1,
      monthlyFee: 1500000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Ban công'],
      description: 'Phòng ba người tòa D với ban công và tủ lạnh mini'
    },
    {
      id: 'D201',
      building: 'D',
      floor: 2,
      roomNumber: '201',
      roomType: 'Phòng đôi cao cấp',
      capacity: 2,
      currentOccupancy: 0,
      monthlyFee: 3100000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công'],
      description: 'Phòng đôi cao cấp tầng 2 tòa D với đầy đủ tiện nghi'
    },
    {
      id: 'D202',
      building: 'D',
      floor: 2,
      roomNumber: '202',
      roomType: 'Phòng đơn cao cấp',
      capacity: 1,
      currentOccupancy: 0,
      monthlyFee: 2700000,
      status: 'available',
      facilities: ['Wifi', 'Bàn học', 'Tủ quần áo', 'Điều hòa', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công'],
      description: 'Phòng đơn cao cấp tầng 2 tòa D với ban công và view tuyệt đẹp'
    }
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

  // Extract unique values for filters
  const zones = [...new Set(mockAvailableRooms.map(room => `Khu ${room.building}`))];
  const buildings = [...new Set(mockAvailableRooms.map(room => `Tòa ${room.building}`))];
  const roomTypes = [...new Set(mockAvailableRooms.map(room => room.roomType))];

  useEffect(() => {
    filterRooms();
  }, [filters]);

  useEffect(() => {
    // Calculate pagination for filtered rooms
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedRooms(filteredRooms.slice(startIndex, endIndex));
  }, [filteredRooms, currentPage, itemsPerPage]);

  const filterRooms = () => {
    let filtered = mockAvailableRooms.filter(room => {
      return (
        (!filters.zone || `Khu ${room.building}` === filters.zone) &&
        (!filters.building || `Tòa ${room.building}` === filters.building) &&
        (!filters.roomType || room.roomType === filters.roomType) &&
        (!filters.priceRange || checkPriceRange(room.monthlyFee, filters.priceRange)) &&
        room.status === filters.status
      );
    });

    setFilteredRooms(filtered);
  };

  const checkPriceRange = (price, range) => {
    switch (range) {
      case 'under-1.5':
        return price < 1500000;
      case '1.5-2':
        return price >= 1500000 && price < 2000000;
      case '2-2.5':
        return price >= 2000000 && price < 2500000;
      case 'over-2.5':
        return price >= 2500000;
      default:
        return true;
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransferRequest = () => {
    setShowRoomSelection(true);
    setError('');
  };

  const handleRoomSelect = (room) => {
    // Check if selected room is the same as current room
    if (room.id === `${currentContract?.currentRoom?.building || ''}${currentContract?.currentRoom?.roomNumber || ''}`) {
      setError('Phòng bạn chọn trùng với phòng hiện tại. Vui lòng chọn phòng khác để thực hiện chuyển phòng.');
      return;
    }

    // Check if room is available
    if (room.status !== 'available' || room.currentOccupancy >= room.capacity) {
      setError('Phòng hiện tại đã đủ người, vui lòng chọn phòng khác.');
      return;
    }

    setSelectedRoom(room);
    setError('');
  };

  const handleTransferConfirm = async () => {
    if (!selectedRoom) {
      setError('Vui lòng chọn phòng để chuyển');
      return;
    }

    setIsTransferring(true);
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Update contract with new room information
        const updatedContract = {
          ...currentContract,
          currentRoom: {
            building: selectedRoom.building,
            floor: selectedRoom.floor,
            roomNumber: selectedRoom.roomNumber,
            roomType: selectedRoom.roomType,
            capacity: selectedRoom.capacity,
            currentOccupancy: selectedRoom.currentOccupancy + 1, // Add current student
            monthlyFee: selectedRoom.monthlyFee
          },
          transferHistory: [
            ...(currentContract.transferHistory || []),
            {
              id: Date.now(),
              transferDate: new Date().toISOString().split('T')[0],
              fromRoom: `${currentContract?.currentRoom?.building || ''}${currentContract?.currentRoom?.roomNumber || ''}`,
              toRoom: `${selectedRoom.building}${selectedRoom.roomNumber}`,
              reason: 'Student request',
              status: 'completed'
            }
          ]
        };

        // Create room transfer request with full details for admin approval
        const roomTransferRequest = {
          id: `TRANSFER${Date.now()}`,
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
            monthlyFee: currentContract?.currentRoom?.monthlyFee || 800000,
            floor: currentContract?.currentRoom?.floor || 1,
            capacity: currentContract?.currentRoom?.capacity || 2,
            currentOccupancy: currentContract?.currentRoom?.currentOccupancy || 2
          },
          targetRoom: {
            roomNumber: `${selectedRoom.building}${selectedRoom.roomNumber}`,
            building: `Tòa ${selectedRoom.building}`,
            zone: `Khu ${selectedRoom.building}`,
            roomType: selectedRoom.roomType,
            monthlyFee: selectedRoom.monthlyFee,
            floor: selectedRoom.floor,
            capacity: selectedRoom.capacity,
            currentOccupancy: selectedRoom.currentOccupancy
          },
          transfer: {
            requestDate: new Date().toISOString().split('T')[0],
            reason: 'Cần không gian riêng tư để học tập',
            expectedTransferDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            urgency: 'Bình thường',
            notes: 'Chuyển phòng để có không gian học tập tốt hơn'
          },
          contract: {
            contractId: currentContract.contractId,
            startDate: currentContract.startDate,
            endDate: currentContract.endDate,
            deposit: currentContract.deposit,
            currentMonthlyFee: currentContract?.currentRoom?.monthlyFee || 800000,
            newMonthlyFee: selectedRoom.monthlyFee,
            feeDifference: selectedRoom.monthlyFee - (currentContract?.currentRoom?.monthlyFee || 800000),
            totalPaid: currentContract.totalPaid || 0,
            remainingAmount: currentContract.remainingAmount || 0
          },
          status: 'pending',
          createdAt: new Date().toISOString(),
          documents: {
            transferRequest: true,
            roomConditionReport: true,
            studentId: true,
            roomContract: true,
            reasonDocument: true
          }
        };
        
        // Save room transfer request to localStorage for admin approval
        const existingRequests = JSON.parse(localStorage.getItem('roomTransferRequests') || '[]');
        existingRequests.push(roomTransferRequest);
        localStorage.setItem('roomTransferRequests', JSON.stringify(existingRequests));

        // Also save to old format for backward compatibility
        localStorage.setItem('roomContract', JSON.stringify(updatedContract));
        
        // Simulate sending email notification
        console.log(`Room transfer email sent to ${user?.email || 'student@example.com'}`);
        
        setIsLoading(false);
        setIsTransferring(false);
        
        // Show success message
        alert(`Đơn chuyển phòng đã được gửi thành công!\nTừ phòng: ${currentContract?.currentRoom?.building || ''}${currentContract?.currentRoom?.roomNumber || ''}\nĐến phòng: ${selectedRoom.building}${selectedRoom.roomNumber}\nĐơn sẽ được xem xét và duyệt bởi quản trị viên.\nEmail thông báo đã được gửi đến ${user?.email || 'email của bạn'}`);
        
        if (onSuccess) {
          onSuccess(updatedContract);
        }
      } catch (err) {
        setError('Chuyển phòng không thành công, vui lòng thử lại');
        setIsLoading(false);
        setIsTransferring(false);
      }
    }, 2000);
  };

  const handleBackToContract = () => {
    setShowRoomSelection(false);
    setSelectedRoom(null);
    setError('');
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

  const getRoomStatusColor = (room) => {
    if (room.status === 'occupied' || room.currentOccupancy >= room.capacity) {
      return 'bg-red-100 text-red-800';
    } else if (room.currentOccupancy > 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getRoomStatusText = (room) => {
    if (room.status === 'occupied' || room.currentOccupancy >= room.capacity) {
      return 'Đã đủ người';
    } else if (room.currentOccupancy > 0) {
      return `Còn ${room.capacity - room.currentOccupancy} chỗ`;
    } else {
      return 'Còn trống';
    }
  };

  if (!currentContract) {
    console.log('RoomTransfer: No contract, showing loading');
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

  if (showRoomSelection) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Chọn phòng mới</h1>
            <p className="mt-2 text-gray-600">Chọn phòng bạn muốn chuyển đến</p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Phòng hiện tại:</span> {currentContract?.currentRoom?.building || 'N/A'}{currentContract?.currentRoom?.roomNumber || 'N/A'} ({currentContract?.currentRoom?.roomType || 'N/A'})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
                
                <div className="space-y-4">
                  {/* Zone Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khu
                    </label>
                    <select
                      value={filters.zone}
                      onChange={(e) => handleFilterChange('zone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả khu</option>
                      {zones.map(zone => (
                        <option key={zone} value={zone}>{zone}</option>
                      ))}
                    </select>
                  </div>

                  {/* Building Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tòa
                    </label>
                    <select
                      value={filters.building}
                      onChange={(e) => handleFilterChange('building', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả tòa</option>
                      {buildings.map(building => (
                        <option key={building} value={building}>{building}</option>
                      ))}
                    </select>
                  </div>

                  {/* Room Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại phòng
                    </label>
                    <select
                      value={filters.roomType}
                      onChange={(e) => handleFilterChange('roomType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả loại</option>
                      {roomTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoảng giá
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Tất cả mức giá</option>
                      <option value="under-1.5">Dưới 1.5 triệu</option>
                      <option value="1.5-2">1.5 - 2 triệu</option>
                      <option value="2-2.5">2 - 2.5 triệu</option>
                      <option value="over-2.5">Trên 2.5 triệu</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">Còn trống</option>
                      <option value="occupied">Đã thuê</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  onClick={() => setFilters({
                    zone: '',
                    building: '',
                    roomType: '',
                    priceRange: '',
                    status: 'available'
                  })}
                  variant="outline"
                  fullWidth
                  className="mt-4"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            </div>

            {/* Room List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Danh sách phòng ({filteredRooms.length} phòng)
                    </h3>
                    {selectedRoom && (
                      <div className="text-sm text-blue-600 font-medium">
                        Đã chọn: {selectedRoom.building}{selectedRoom.roomNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🏠</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Không tìm thấy phòng phù hợp
                      </h3>
                      <p className="text-gray-500">
                        Hãy thử thay đổi bộ lọc để tìm phòng khác
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
                            room.status === 'occupied' || room.currentOccupancy >= room.capacity
                              ? 'opacity-60 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={() => handleRoomSelect(room)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {room.building}{room.roomNumber}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Tòa {room.building} - Khu {room.building}
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
                              <span className="text-gray-600">Diện tích:</span>
                              <span className="font-medium">{room.area}m²</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Giá thuê:</span>
                              <span className="font-medium text-green-600">{formatPrice(room.monthlyFee)}/tháng</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Tiện nghi:</p>
                            <div className="flex flex-wrap gap-1">
                              {room.facilities.map((facility, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="text-sm text-gray-500">{room.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {filteredRooms.length > itemsPerPage && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredRooms.length / itemsPerPage)}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredRooms.length}
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
            >
              Quay lại
            </Button>
            
            {selectedRoom && (
              <Button
                variant="success"
                onClick={handleTransferConfirm}
                loading={isLoading}
                loadingText="Đang chuyển phòng..."
              >
                Xác nhận chuyển đến {selectedRoom.building}{selectedRoom.roomNumber}
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

          {/* Transfer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chuyển phòng</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Chỉ có thể chuyển đến phòng còn chỗ trống</li>
                  <li>• Phí phòng có thể thay đổi tùy theo loại phòng</li>
                  <li>• Thời gian chuyển phòng: 1-2 ngày làm việc</li>
                  <li>• Email xác nhận sẽ được gửi sau khi chuyển thành công</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Quy trình chuyển phòng:</h4>
                <ol className="text-sm text-yellow-800 space-y-1">
                  <li>1. Chọn phòng muốn chuyển đến</li>
                  <li>2. Xác nhận thông tin chuyển phòng</li>
                  <li>3. Chờ phê duyệt từ quản lý KTX</li>
                  <li>4. Nhận email xác nhận và thông báo chuyển phòng</li>
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
                  variant="primary"
                  onClick={handleTransferRequest}
                >
                  Chọn phòng mới
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer History */}
        {currentContract.transferHistory && currentContract.transferHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Lịch sử chuyển phòng</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày chuyển
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Từ phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đến phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentContract.transferHistory.map((transfer) => (
                    <tr key={transfer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transfer.transferDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.fromRoom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transfer.toRoom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transfer.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
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

export default RoomTransfer;
