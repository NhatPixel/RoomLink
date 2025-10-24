import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';

const HealthCheckupRegistration = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [checkupSessions, setCheckupSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  // Mock data for health checkup sessions
  const mockCheckupSessions = [
    {
      id: 1,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 1',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-01-15',
      endDate: '2024-01-30',
      registrationDeadline: '2024-01-10',
      maxParticipants: 200,
      currentParticipants: 45,
      status: 'open', // open, closed, full
      availableDates: [
        { date: '2024-01-15', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-01-16', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-01-17', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-01-18', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] },
        { date: '2024-01-19', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 2,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 2',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-06-15',
      endDate: '2024-06-30',
      registrationDeadline: '2024-06-10',
      maxParticipants: 200,
      currentParticipants: 12,
      status: 'open',
      availableDates: [
        { date: '2024-06-15', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-06-16', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-06-17', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 3,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 3',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-09-15',
      endDate: '2024-09-30',
      registrationDeadline: '2024-09-10',
      maxParticipants: 200,
      currentParticipants: 198,
      status: 'full',
      availableDates: [],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 4,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 4',
      description: 'Khám sức khỏe tổng quát cho sinh viên năm cuối',
      startDate: '2024-12-01',
      endDate: '2024-12-15',
      registrationDeadline: '2024-11-25',
      maxParticipants: 150,
      currentParticipants: 89,
      status: 'open',
      availableDates: [
        { date: '2024-12-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-12-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-12-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 2, Tòa B',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)',
        'Mang theo giấy tờ chứng minh là sinh viên năm cuối'
      ]
    },
    {
      id: 5,
      name: 'Đợt khám sức khỏe đặc biệt - Khám tim mạch',
      description: 'Khám sức khỏe chuyên sâu về tim mạch',
      startDate: '2024-02-01',
      endDate: '2024-02-10',
      registrationDeadline: '2024-01-25',
      maxParticipants: 50,
      currentParticipants: 23,
      status: 'open',
      availableDates: [
        { date: '2024-02-01', timeSlots: ['08:00-09:00', '09:00-10:00'] },
        { date: '2024-02-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-02-03', timeSlots: ['08:00-09:00', '09:00-10:00'] }
      ],
      location: 'Phòng khám chuyên khoa - Tầng 3, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 12 tiếng trước khi khám',
        'Không uống cà phê, trà trong 24h trước khám',
        'Mang theo kết quả ECG cũ (nếu có)'
      ]
    },
    {
      id: 6,
      name: 'Đợt khám sức khỏe đặc biệt - Khám mắt',
      description: 'Khám sức khỏe chuyên sâu về mắt',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      registrationDeadline: '2024-02-20',
      maxParticipants: 100,
      currentParticipants: 67,
      status: 'open',
      availableDates: [
        { date: '2024-03-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-03-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-03-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] }
      ],
      location: 'Phòng khám mắt - Tầng 2, Tòa C',
      requirements: [
        'Mang theo CMND/CCCD',
        'Không đeo kính áp tròng trong 24h trước khám',
        'Mang theo kết quả khám mắt cũ (nếu có)',
        'Mang theo đơn kính hiện tại (nếu có)'
      ]
    },
    {
      id: 7,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 5',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-04-01',
      endDate: '2024-04-20',
      registrationDeadline: '2024-03-25',
      maxParticipants: 180,
      currentParticipants: 156,
      status: 'open',
      availableDates: [
        { date: '2024-04-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-04-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-04-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 8,
      name: 'Đợt khám sức khỏe đặc biệt - Khám răng miệng',
      description: 'Khám sức khỏe chuyên sâu về răng miệng',
      startDate: '2024-05-01',
      endDate: '2024-05-10',
      registrationDeadline: '2024-04-20',
      maxParticipants: 80,
      currentParticipants: 45,
      status: 'open',
      availableDates: [
        { date: '2024-05-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-05-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-05-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám nha khoa - Tầng 1, Tòa D',
      requirements: [
        'Mang theo CMND/CCCD',
        'Đánh răng trước khi khám',
        'Mang theo kết quả khám răng cũ (nếu có)',
        'Không ăn đồ ngọt trong 2h trước khám'
      ]
    },
    {
      id: 9,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 6',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-07-01',
      endDate: '2024-07-20',
      registrationDeadline: '2024-06-25',
      maxParticipants: 200,
      currentParticipants: 89,
      status: 'open',
      availableDates: [
        { date: '2024-07-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-07-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-07-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 10,
      name: 'Đợt khám sức khỏe đặc biệt - Khám tâm lý',
      description: 'Khám sức khỏe tâm lý cho sinh viên',
      startDate: '2024-08-01',
      endDate: '2024-08-15',
      registrationDeadline: '2024-07-25',
      maxParticipants: 60,
      currentParticipants: 34,
      status: 'open',
      availableDates: [
        { date: '2024-08-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-08-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-08-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám tâm lý - Tầng 3, Tòa B',
      requirements: [
        'Mang theo CMND/CCCD',
        'Chuẩn bị tinh thần thoải mái',
        'Mang theo kết quả khám tâm lý cũ (nếu có)',
        'Không cần nhịn ăn'
      ]
    },
    {
      id: 11,
      name: 'Đợt khám sức khỏe định kỳ học kỳ 7',
      description: 'Khám sức khỏe tổng quát cho sinh viên',
      startDate: '2024-10-01',
      endDate: '2024-10-20',
      registrationDeadline: '2024-09-25',
      maxParticipants: 200,
      currentParticipants: 123,
      status: 'open',
      availableDates: [
        { date: '2024-10-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-10-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-10-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám KTX - Tầng 1, Tòa A',
      requirements: [
        'Mang theo CMND/CCCD',
        'Nhịn ăn 8 tiếng trước khi khám',
        'Mang theo kết quả khám sức khỏe cũ (nếu có)'
      ]
    },
    {
      id: 12,
      name: 'Đợt khám sức khỏe đặc biệt - Khám da liễu',
      description: 'Khám sức khỏe chuyên sâu về da liễu',
      startDate: '2024-11-01',
      endDate: '2024-11-10',
      registrationDeadline: '2024-10-25',
      maxParticipants: 70,
      currentParticipants: 28,
      status: 'open',
      availableDates: [
        { date: '2024-11-01', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] },
        { date: '2024-11-02', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00', '14:00-15:00'] },
        { date: '2024-11-03', timeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'] }
      ],
      location: 'Phòng khám da liễu - Tầng 2, Tòa C',
      requirements: [
        'Mang theo CMND/CCCD',
        'Không sử dụng mỹ phẩm trong 24h trước khám',
        'Mang theo kết quả khám da cũ (nếu có)',
        'Không cần nhịn ăn'
      ]
    }
  ];

  // Mock user registrations
  const getUserRegistrations = () => {
    const registrations = localStorage.getItem('healthCheckupRegistrations');
    return registrations ? JSON.parse(registrations) : [];
  };

  const saveUserRegistration = (registration) => {
    const registrations = getUserRegistrations();
    registrations.push(registration);
    localStorage.setItem('healthCheckupRegistrations', JSON.stringify(registrations));
  };

  useEffect(() => {
    // Load health checkup sessions from localStorage and combine with mock data
    const loadCheckupSessions = () => {
      try {
        const savedSessions = JSON.parse(localStorage.getItem('healthCheckupSessions') || '[]');
        const allSessions = [...mockCheckupSessions];
        
        // Add saved sessions if they don't already exist
        savedSessions.forEach(savedSession => {
          if (!allSessions.find(session => session.id === savedSession.id)) {
            allSessions.push(savedSession);
          }
        });
        
        setCheckupSessions(allSessions);
        setLoading(false);
      } catch (error) {
        console.error('Error loading health checkup sessions:', error);
        setCheckupSessions(mockCheckupSessions);
        setLoading(false);
      }
    };

    loadCheckupSessions();
  }, []);

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setSelectedDate('');
    setSelectedTimeSlot('');
    setError('');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    setError('');
  };

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedSession) {
      setError('Vui lòng chọn đợt khám sức khỏe');
      return;
    }

    if (!selectedDate) {
      setError('Vui lòng chọn ngày khám');
      return;
    }

    if (!selectedTimeSlot) {
      setError('Vui lòng chọn khung giờ khám');
      return;
    }

    // Check if user already registered for this session
    const userRegistrations = getUserRegistrations();
    const existingRegistration = userRegistrations.find(
      reg => reg.userId === user.id && reg.sessionId === selectedSession.id
    );

    if (existingRegistration) {
      setError('Bạn đã đăng ký khám cho đợt này rồi');
      return;
    }

    // Create registration
    const registration = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      sessionId: selectedSession.id,
      sessionName: selectedSession.name,
      selectedDate: selectedDate,
      selectedTimeSlot: selectedTimeSlot,
      registrationDate: new Date().toISOString(),
      status: 'confirmed'
    };

    try {
      saveUserRegistration(registration);
      setSuccess('Đăng ký thành công!');
      
      // Update session participants count
      const updatedSessions = checkupSessions.map(session => {
        if (session.id === selectedSession.id) {
          return {
            ...session,
            currentParticipants: session.currentParticipants + 1,
            status: session.currentParticipants + 1 >= session.maxParticipants ? 'full' : 'open'
          };
        }
        return session;
      });
      setCheckupSessions(updatedSessions);

      // Reset form
      setSelectedSession(null);
      setSelectedDate('');
      setSelectedTimeSlot('');

      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(registration);
        }
      }, 2000);

    } catch (error) {
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-green-600 bg-green-100';
      case 'full': return 'text-red-600 bg-red-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Đang mở đăng ký';
      case 'full': return 'Đã đầy';
      case 'closed': return 'Đã đóng';
      default: return 'Không xác định';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(checkupSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSessions = checkupSessions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách đợt khám...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Đăng ký khám sức khỏe</h1>
              <p className="text-gray-600 mt-1">Đăng ký tham gia các đợt khám sức khỏe định kỳ</p>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="small"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              }
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Select Checkup Session */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Bước 1: Chọn đợt khám sức khỏe</h2>
              <div className="grid gap-4">
                {currentSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                      selectedSession?.id === session.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{session.name}</h3>
                        <p className="text-gray-600 mb-3">{session.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Thời gian:</span> {formatDate(session.startDate)} - {formatDate(session.endDate)}
                          </div>
                          <div>
                            <span className="font-medium">Hạn đăng ký:</span> {formatDate(session.registrationDeadline)}
                          </div>
                          <div>
                            <span className="font-medium">Địa điểm:</span> {session.location}
                          </div>
                          <div>
                            <span className="font-medium">Số lượng:</span> {session.currentParticipants}/{session.maxParticipants}
                          </div>
                        </div>

                        <div className="mt-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {checkupSessions.length > itemsPerPage && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={checkupSessions.length}
                    showInfo={true}
                  />
                </div>
              )}
            </div>

            {/* Step 2: Select Date and Time */}
            {selectedSession && selectedSession.status === 'open' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Bước 2: Chọn ngày và giờ khám</h2>
                
                {/* Select Date */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Chọn ngày khám:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedSession.availableDates.map((dateInfo) => (
                      <button
                        key={dateInfo.date}
                        type="button"
                        onClick={() => handleDateSelect(dateInfo.date)}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          selectedDate === dateInfo.date
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{formatDate(dateInfo.date)}</div>
                        <div className="text-sm text-gray-600">
                          {dateInfo.timeSlots.length} khung giờ có sẵn
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Time Slot */}
                {selectedDate && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">Chọn khung giờ khám:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedSession.availableDates
                        .find(d => d.date === selectedDate)
                        ?.timeSlots.map((timeSlot) => (
                          <button
                            key={timeSlot}
                            type="button"
                            onClick={() => handleTimeSlotSelect(timeSlot)}
                            className={`p-3 border rounded-lg text-center transition-colors ${
                              selectedTimeSlot === timeSlot
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {timeSlot}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Lưu ý trước khi khám:</h3>
                  <ul className="list-disc list-inside text-yellow-700 space-y-1">
                    {selectedSession.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedSession && selectedSession.status === 'open' && selectedDate && selectedTimeSlot && (
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Đăng ký khám sức khỏe
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckupRegistration;
