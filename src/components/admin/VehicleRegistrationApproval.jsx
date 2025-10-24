import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';

const VehicleRegistrationApproval = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [vehicleRequests, setVehicleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mock data cho các đơn đăng ký xe
  const mockVehicleRequests = [
    {
      id: 'VEHICLE001',
      studentId: 'SV001',
      studentName: 'Nguyễn Văn An',
      studentEmail: 'an.nguyen@student.hust.edu.vn',
      studentPhone: '0123456789',
      studentIdNumber: '20190001',
      vehicle: {
        licensePlate: '30A-12345',
        vehicleType: 'Xe máy',
        brand: 'Honda',
        model: 'Wave RSX',
        color: 'Đỏ',
        engineNumber: 'ABC123456',
        chassisNumber: 'XYZ789012',
        yearOfManufacture: 2020,
        description: 'Xe máy cá nhân sử dụng hàng ngày',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-06-15',
        purpose: 'Đi lại hàng ngày',
        expectedStartDate: '2024-07-01',
        duration: '12 tháng',
        notes: 'Xe mới mua, đầy đủ giấy tờ'
      },
      status: 'pending',
      createdAt: '2024-06-15T10:30:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: true,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE002',
      studentId: 'SV002',
      studentName: 'Trần Thị Bình',
      studentEmail: 'binh.tran@student.hust.edu.vn',
      studentPhone: '0987654321',
      studentIdNumber: '20190002',
      vehicle: {
        licensePlate: '29B-67890',
        vehicleType: 'Xe máy',
        brand: 'Yamaha',
        model: 'Exciter 150',
        color: 'Xanh',
        engineNumber: 'DEF456789',
        chassisNumber: 'UVW345678',
        yearOfManufacture: 2019,
        description: 'Xe máy thể thao',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-06-20',
        purpose: 'Đi học và đi làm thêm',
        expectedStartDate: '2024-07-01',
        duration: '12 tháng',
        notes: 'Xe đã sử dụng 2 năm'
      },
      status: 'pending',
      createdAt: '2024-06-20T14:15:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: true,
        studentId: true,
        roomContract: false
      }
    },
    {
      id: 'VEHICLE003',
      studentId: 'SV003',
      studentName: 'Lê Minh Cường',
      studentEmail: 'cuong.le@student.hust.edu.vn',
      studentPhone: '0369258147',
      studentIdNumber: '20190003',
      vehicle: {
        licensePlate: '43C-11111',
        vehicleType: 'Xe đạp điện',
        brand: 'VinFast',
        model: 'Klara S',
        color: 'Trắng',
        engineNumber: 'GHI789012',
        chassisNumber: 'RST456789',
        yearOfManufacture: 2021,
        description: 'Xe đạp điện thân thiện môi trường',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-06-25',
        purpose: 'Đi lại trong khuôn viên trường',
        expectedStartDate: '2024-07-01',
        duration: '12 tháng',
        notes: 'Xe điện không gây tiếng ồn'
      },
      status: 'pending',
      createdAt: '2024-06-25T09:45:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: false,
        driverLicense: false,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE004',
      studentId: 'SV004',
      studentName: 'Phạm Thị Dung',
      studentEmail: 'dung.pham@student.hust.edu.vn',
      studentPhone: '0741852963',
      studentIdNumber: '20190004',
      vehicle: {
        licensePlate: '30A-22222',
        vehicleType: 'Xe máy',
        brand: 'SYM',
        model: 'Attila',
        color: 'Hồng',
        engineNumber: 'JKL012345',
        chassisNumber: 'MNO567890',
        yearOfManufacture: 2022,
        description: 'Xe máy phù hợp nữ giới',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-06-28',
        purpose: 'Đi học và sinh hoạt',
        expectedStartDate: '2024-07-01',
        duration: '12 tháng',
        notes: 'Xe mới, đầy đủ bảo hiểm'
      },
      status: 'approved',
      createdAt: '2024-06-28T16:20:00Z',
      approvedAt: '2024-06-29T10:00:00Z',
      approvedBy: 'Admin001',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: true,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE005',
      studentId: 'SV005',
      studentName: 'Hoàng Văn Em',
      studentEmail: 'em.hoang@student.hust.edu.vn',
      studentPhone: '0852741963',
      studentIdNumber: '20190005',
      vehicle: {
        licensePlate: '29B-33333',
        vehicleType: 'Xe máy',
        brand: 'Piaggio',
        model: 'Vespa',
        color: 'Vàng',
        engineNumber: 'PQR345678',
        chassisNumber: 'TUV678901',
        yearOfManufacture: 2020,
        description: 'Xe máy vintage',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-07-01',
        purpose: 'Đi lại và du lịch',
        expectedStartDate: '2024-07-15',
        duration: '12 tháng',
        notes: 'Xe cổ điển, cần bảo dưỡng định kỳ'
      },
      status: 'rejected',
      createdAt: '2024-07-01T11:30:00Z',
      rejectedAt: '2024-07-02T09:15:00Z',
      rejectedBy: 'Admin002',
      rejectionReason: 'Thiếu giấy bảo hiểm xe',
      documents: {
        vehicleRegistration: true,
        insurance: false,
        driverLicense: true,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE006',
      studentId: 'SV006',
      studentName: 'Vũ Thị Phương',
      studentEmail: 'phuong.vu@student.hust.edu.vn',
      studentPhone: '0963852741',
      studentIdNumber: '20190006',
      vehicle: {
        licensePlate: '43C-44444',
        vehicleType: 'Xe máy',
        brand: 'Kawasaki',
        model: 'Ninja 250',
        color: 'Xanh lá',
        engineNumber: 'WXY789012',
        chassisNumber: 'ZAB123456',
        yearOfManufacture: 2021,
        description: 'Xe máy thể thao cao cấp',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-07-05',
        purpose: 'Đi học và thể thao',
        expectedStartDate: '2024-07-15',
        duration: '12 tháng',
        notes: 'Xe thể thao, cần giấy phép lái xe A2'
      },
      status: 'pending',
      createdAt: '2024-07-05T13:45:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: true,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE007',
      studentId: 'SV007',
      studentName: 'Đặng Minh Giang',
      studentEmail: 'giang.dang@student.hust.edu.vn',
      studentPhone: '0741963852',
      studentIdNumber: '20190007',
      vehicle: {
        licensePlate: '30A-55555',
        vehicleType: 'Xe đạp điện',
        brand: 'Gogoro',
        model: 'Viva Mix',
        color: 'Đen',
        engineNumber: 'CDE234567',
        chassisNumber: 'FGH456789',
        yearOfManufacture: 2022,
        description: 'Xe đạp điện thông minh',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-07-08',
        purpose: 'Đi lại tiết kiệm chi phí',
        expectedStartDate: '2024-07-20',
        duration: '12 tháng',
        notes: 'Xe điện thông minh, có GPS'
      },
      status: 'pending',
      createdAt: '2024-07-08T15:20:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: false,
        studentId: true,
        roomContract: true
      }
    },
    {
      id: 'VEHICLE008',
      studentId: 'SV008',
      studentName: 'Bùi Thị Hoa',
      studentEmail: 'hoa.bui@student.hust.edu.vn',
      studentPhone: '0852741963',
      studentIdNumber: '20190008',
      vehicle: {
        licensePlate: '29B-66666',
        vehicleType: 'Xe máy',
        brand: 'Ducati',
        model: 'Monster',
        color: 'Đỏ',
        engineNumber: 'IJK567890',
        chassisNumber: 'LMN789012',
        yearOfManufacture: 2023,
        description: 'Xe máy cao cấp nhập khẩu',
        imageUrl: '/api/placeholder/300/200'
      },
      registration: {
        requestDate: '2024-07-10',
        purpose: 'Đi lại và sở thích cá nhân',
        expectedStartDate: '2024-08-01',
        duration: '12 tháng',
        notes: 'Xe nhập khẩu, đầy đủ giấy tờ hải quan'
      },
      status: 'pending',
      createdAt: '2024-07-10T10:15:00Z',
      documents: {
        vehicleRegistration: true,
        insurance: true,
        driverLicense: true,
        studentId: true,
        roomContract: true
      }
    }
  ];

  useEffect(() => {
    // Load vehicle requests from localStorage and combine with mock data
    const loadVehicleRequests = () => {
      try {
        const savedRequests = JSON.parse(localStorage.getItem('vehicleRegistrationRequests') || '[]');
        const allRequests = [...mockVehicleRequests];
        
        // Add saved requests if they don't already exist
        savedRequests.forEach(savedRequest => {
          if (!allRequests.find(req => req.id === savedRequest.id)) {
            allRequests.push(savedRequest);
          }
        });
        
        setVehicleRequests(allRequests);
        setLoading(false);
      } catch (error) {
        console.error('Error loading vehicle requests:', error);
        setVehicleRequests(mockVehicleRequests);
        setLoading(false);
      }
    };

    loadVehicleRequests();
  }, []);

  // Filter requests based on status
  const filteredRequests = vehicleRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === currentRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(currentRequests.map(req => req.id));
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApproveSelected = () => {
    if (selectedRequests.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn để duyệt');
      return;
    }

    const approvedRequests = selectedRequests.map(requestId => {
      const request = vehicleRequests.find(req => req.id === requestId);
      return {
        ...request,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.id || 'Admin001'
      };
    });

    // Update requests
    const updatedRequests = vehicleRequests.map(request => {
      if (selectedRequests.includes(request.id)) {
        return {
          ...request,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: user?.id || 'Admin001'
        };
      }
      return request;
    });

    setVehicleRequests(updatedRequests);
    localStorage.setItem('vehicleRegistrationRequests', JSON.stringify(updatedRequests));

    // Update student vehicle information
    approvedRequests.forEach(request => {
      const studentVehicleInfo = {
        studentId: request.studentId,
        studentName: request.studentName,
        vehicle: request.vehicle,
        registrationDate: new Date().toISOString(),
        status: 'active',
        approvedBy: user?.id || 'Admin001'
      };

      // Save to student vehicle records
      const existingVehicles = JSON.parse(localStorage.getItem('studentVehicles') || '[]');
      const existingIndex = existingVehicles.findIndex(v => v.studentId === request.studentId);
      
      if (existingIndex >= 0) {
        existingVehicles[existingIndex] = studentVehicleInfo;
      } else {
        existingVehicles.push(studentVehicleInfo);
      }
      
      localStorage.setItem('studentVehicles', JSON.stringify(existingVehicles));
    });

    alert(`Đã duyệt thành công ${selectedRequests.length} đơn đăng ký xe!`);
    setSelectedRequests([]);
  };

  const handleRejectSelected = () => {
    if (selectedRequests.length === 0) {
      alert('Vui lòng chọn ít nhất một đơn để từ chối');
      return;
    }

    const rejectionReason = prompt('Nhập lý do từ chối:');
    if (!rejectionReason) return;

    const updatedRequests = vehicleRequests.map(request => {
      if (selectedRequests.includes(request.id)) {
        return {
          ...request,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.id || 'Admin001',
          rejectionReason: rejectionReason
        };
      }
      return request;
    });

    setVehicleRequests(updatedRequests);
    localStorage.setItem('vehicleRegistrationRequests', JSON.stringify(updatedRequests));

    alert(`Đã từ chối ${selectedRequests.length} đơn đăng ký xe!`);
    setSelectedRequests([]);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
      approved: { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
      rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getVehicleTypeBadge = (vehicleType) => {
    const typeConfig = {
      'Xe máy': { color: 'bg-blue-100 text-blue-800' },
      'Xe đạp điện': { color: 'bg-green-100 text-green-800' },
      'Xe đạp': { color: 'bg-gray-100 text-gray-800' },
      'Ô tô': { color: 'bg-purple-100 text-purple-800' }
    };
    
    const config = typeConfig[vehicleType] || typeConfig['Xe máy'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {vehicleType}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Duyệt đơn đăng ký xe</h1>
              <p className="text-gray-600 mt-1">Quản lý và duyệt các đơn đăng ký biển số xe của sinh viên</p>
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

          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Tổng đơn</p>
                  <p className="text-2xl font-bold text-blue-900">{vehicleRequests.length}</p>
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
                  <p className="text-2xl font-bold text-yellow-900">
                    {vehicleRequests.filter(req => req.status === 'pending').length}
                  </p>
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
                  <p className="text-2xl font-bold text-green-900">
                    {vehicleRequests.filter(req => req.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">Từ chối</p>
                  <p className="text-2xl font-bold text-red-900">
                    {vehicleRequests.filter(req => req.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {selectedRequests.length > 0 && (
            <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">
                Đã chọn {selectedRequests.length} đơn
              </span>
              <Button
                onClick={handleApproveSelected}
                variant="success"
              >
                Duyệt đã chọn
              </Button>
              <Button
                onClick={handleRejectSelected}
                variant="danger"
              >
                Từ chối đã chọn
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Tổng cộng {filteredRequests.length} đơn
              </span>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn đăng ký xe</h3>
              <p className="mt-1 text-sm text-gray-500">Hiện tại chưa có đơn đăng ký xe nào.</p>
            </div>
          ) : (
            <>
              {/* Requests List */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedRequests.length === currentRequests.length && currentRequests.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sinh viên
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thông tin xe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mục đích sử dụng
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
                      {currentRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => handleSelectRequest(request.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.studentName}</div>
                              <div className="text-sm text-gray-500">{request.studentId}</div>
                              <div className="text-sm text-gray-500">{request.studentEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.vehicle.licensePlate}</div>
                              <div className="text-sm text-gray-500">{request.vehicle.brand} {request.vehicle.model}</div>
                              <div className="text-sm text-gray-500">{getVehicleTypeBadge(request.vehicle.vehicleType)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.registration.purpose}</div>
                            <div className="text-sm text-gray-500">
                              Thời hạn: {request.registration.duration}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(request.registration.requestDate)}</div>
                            <div className="text-sm text-gray-500">
                              Dự kiến: {formatDate(request.registration.expectedStartDate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetail(request)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredRequests.length}
                  showInfo={true}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn đăng ký xe</h2>
              <Button
                onClick={() => setShowDetailModal(false)}
                variant="ghost"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin sinh viên</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Họ tên:</span> {selectedRequest.studentName}</div>
                  <div><span className="font-medium">Mã SV:</span> {selectedRequest.studentId}</div>
                  <div><span className="font-medium">Email:</span> {selectedRequest.studentEmail}</div>
                  <div><span className="font-medium">SĐT:</span> {selectedRequest.studentPhone}</div>
                  <div><span className="font-medium">MSSV:</span> {selectedRequest.studentIdNumber}</div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin xe</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Biển số:</span> {selectedRequest.vehicle.licensePlate}</div>
                  <div><span className="font-medium">Loại xe:</span> {selectedRequest.vehicle.vehicleType}</div>
                  <div><span className="font-medium">Hãng:</span> {selectedRequest.vehicle.brand}</div>
                  <div><span className="font-medium">Model:</span> {selectedRequest.vehicle.model}</div>
                  <div><span className="font-medium">Màu sắc:</span> {selectedRequest.vehicle.color}</div>
                  <div><span className="font-medium">Năm sản xuất:</span> {selectedRequest.vehicle.yearOfManufacture}</div>
                  <div><span className="font-medium">Số máy:</span> {selectedRequest.vehicle.engineNumber}</div>
                  <div><span className="font-medium">Số khung:</span> {selectedRequest.vehicle.chassisNumber}</div>
                  <div><span className="font-medium">Mô tả:</span> {selectedRequest.vehicle.description}</div>
                </div>
              </div>

              {/* Registration Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin đăng ký</h3>
                <div className="space-y-2">
                  <div><span className="font-medium">Ngày yêu cầu:</span> {formatDate(selectedRequest.registration.requestDate)}</div>
                  <div><span className="font-medium">Mục đích:</span> {selectedRequest.registration.purpose}</div>
                  <div><span className="font-medium">Dự kiến bắt đầu:</span> {formatDate(selectedRequest.registration.expectedStartDate)}</div>
                  <div><span className="font-medium">Thời hạn:</span> {selectedRequest.registration.duration}</div>
                  <div><span className="font-medium">Ghi chú:</span> {selectedRequest.registration.notes}</div>
                </div>
              </div>

              {/* Documents Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái tài liệu</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(selectedRequest.documents).map(([doc, status]) => (
                    <div key={doc} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Information */}
              {selectedRequest.status !== 'pending' && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin xử lý</h3>
                  <div className="space-y-2">
                    {selectedRequest.status === 'approved' && (
                      <>
                        <div><span className="font-medium">Ngày duyệt:</span> {formatDate(selectedRequest.approvedAt)}</div>
                        <div><span className="font-medium">Người duyệt:</span> {selectedRequest.approvedBy}</div>
                      </>
                    )}
                    {selectedRequest.status === 'rejected' && (
                      <>
                        <div><span className="font-medium">Ngày từ chối:</span> {formatDate(selectedRequest.rejectedAt)}</div>
                        <div><span className="font-medium">Người từ chối:</span> {selectedRequest.rejectedBy}</div>
                        <div><span className="font-medium">Lý do từ chối:</span> {selectedRequest.rejectionReason}</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedRequest.status === 'pending' && (
              <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t">
                <Button
                  onClick={() => {
                    const rejectionReason = prompt('Nhập lý do từ chối:');
                    if (rejectionReason) {
                      const updatedRequests = vehicleRequests.map(req => 
                        req.id === selectedRequest.id 
                          ? { ...req, status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: user?.id || 'Admin001', rejectionReason }
                          : req
                      );
                      setVehicleRequests(updatedRequests);
                      localStorage.setItem('vehicleRegistrationRequests', JSON.stringify(updatedRequests));
                      setShowDetailModal(false);
                      alert('Đã từ chối đơn đăng ký xe!');
                    }
                  }}
                  variant="danger"
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() => {
                    const updatedRequests = vehicleRequests.map(req => 
                      req.id === selectedRequest.id 
                        ? { ...req, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user?.id || 'Admin001' }
                        : req
                    );
                    setVehicleRequests(updatedRequests);
                    localStorage.setItem('vehicleRegistrationRequests', JSON.stringify(updatedRequests));

                    // Update student vehicle information
                    const studentVehicleInfo = {
                      studentId: selectedRequest.studentId,
                      studentName: selectedRequest.studentName,
                      vehicle: selectedRequest.vehicle,
                      registrationDate: new Date().toISOString(),
                      status: 'active',
                      approvedBy: user?.id || 'Admin001'
                    };

                    const existingVehicles = JSON.parse(localStorage.getItem('studentVehicles') || '[]');
                    const existingIndex = existingVehicles.findIndex(v => v.studentId === selectedRequest.studentId);
                    
                    if (existingIndex >= 0) {
                      existingVehicles[existingIndex] = studentVehicleInfo;
                    } else {
                      existingVehicles.push(studentVehicleInfo);
                    }
                    
                    localStorage.setItem('studentVehicles', JSON.stringify(existingVehicles));

                    setShowDetailModal(false);
                    alert('Đã duyệt đơn đăng ký xe thành công!');
                  }}
                  variant="success"
                >
                  Duyệt
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleRegistrationApproval;
