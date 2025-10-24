import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import FileUploadButton from '../ui/FileUploadButton';
import Pagination from '../ui/Pagination';

const ElectricityWaterBillCreation = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data cho các phòng và chỉ số điện nước
  const mockRoomData = [
    {
      roomId: 'A101',
      building: 'Tòa A',
      zone: 'Khu A',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1250,
      currentElectricity: 1380,
      electricityUsage: 130,
      previousWater: 45,
      currentWater: 52,
      waterUsage: 7,
      electricityRate: 3000, // VND/kWh
      waterRate: 15000, // VND/m3
      electricityCost: 390000,
      waterCost: 105000,
      totalCost: 495000,
      status: 'processed'
    },
    {
      roomId: 'A102',
      building: 'Tòa A',
      zone: 'Khu A',
      roomType: 'Phòng đơn',
      studentCount: 1,
      previousElectricity: 980,
      currentElectricity: 1050,
      electricityUsage: 70,
      previousWater: 32,
      currentWater: 38,
      waterUsage: 6,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 210000,
      waterCost: 90000,
      totalCost: 300000,
      status: 'processed'
    },
    {
      roomId: 'A103',
      building: 'Tòa A',
      zone: 'Khu A',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1100,
      currentElectricity: 1200,
      electricityUsage: 100,
      previousWater: 40,
      currentWater: 46,
      waterUsage: 6,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 300000,
      waterCost: 90000,
      totalCost: 390000,
      status: 'processed'
    },
    {
      roomId: 'B201',
      building: 'Tòa B',
      zone: 'Khu B',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1350,
      currentElectricity: 1480,
      electricityUsage: 130,
      previousWater: 48,
      currentWater: 55,
      waterUsage: 7,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 390000,
      waterCost: 105000,
      totalCost: 495000,
      status: 'processed'
    },
    {
      roomId: 'B202',
      building: 'Tòa B',
      zone: 'Khu B',
      roomType: 'Phòng đơn',
      studentCount: 1,
      previousElectricity: 920,
      currentElectricity: 980,
      electricityUsage: 60,
      previousWater: 35,
      currentWater: 40,
      waterUsage: 5,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 180000,
      waterCost: 75000,
      totalCost: 255000,
      status: 'processed'
    },
    {
      roomId: 'B203',
      building: 'Tòa B',
      zone: 'Khu B',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1200,
      currentElectricity: 1320,
      electricityUsage: 120,
      previousWater: 42,
      currentWater: 49,
      waterUsage: 7,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 360000,
      waterCost: 105000,
      totalCost: 465000,
      status: 'processed'
    },
    {
      roomId: 'C301',
      building: 'Tòa C',
      zone: 'Khu C',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1400,
      currentElectricity: 1520,
      electricityUsage: 120,
      previousWater: 50,
      currentWater: 58,
      waterUsage: 8,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 360000,
      waterCost: 120000,
      totalCost: 480000,
      status: 'processed'
    },
    {
      roomId: 'C302',
      building: 'Tòa C',
      zone: 'Khu C',
      roomType: 'Phòng đơn',
      studentCount: 1,
      previousElectricity: 1050,
      currentElectricity: 1120,
      electricityUsage: 70,
      previousWater: 38,
      currentWater: 44,
      waterUsage: 6,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 210000,
      waterCost: 90000,
      totalCost: 300000,
      status: 'processed'
    },
    {
      roomId: 'C303',
      building: 'Tòa C',
      zone: 'Khu C',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1300,
      currentElectricity: 1420,
      electricityUsage: 120,
      previousWater: 46,
      currentWater: 53,
      waterUsage: 7,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 360000,
      waterCost: 105000,
      totalCost: 465000,
      status: 'processed'
    },
    {
      roomId: 'A104',
      building: 'Tòa A',
      zone: 'Khu A',
      roomType: 'Phòng đôi',
      studentCount: 2,
      previousElectricity: 1150,
      currentElectricity: 1280,
      electricityUsage: 130,
      previousWater: 44,
      currentWater: 51,
      waterUsage: 7,
      electricityRate: 3000,
      waterRate: 15000,
      electricityCost: 390000,
      waterCost: 105000,
      totalCost: 495000,
      status: 'processed'
    }
  ];

  useEffect(() => {
    setProcessedData(mockRoomData);
  }, []);

  // Filter data based on building
  const filteredData = processedData.filter(room => {
    if (filterBuilding === 'all') return true;
    return room.building === filterBuilding;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (building) => {
    setFilterBuilding(building);
    setCurrentPage(1);
  };

  const handleFileUpload = (file, event) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      setError('Vui lòng chọn file Excel hoặc CSV hợp lệ');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setUploadedFile(file);
    setError('');
    setSuccess('');
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) {
      setError('Vui lòng chọn file để xử lý');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate data extraction and processing
      const processedRooms = mockRoomData.map(room => ({
        ...room,
        // Add some variation to simulate real data processing
        electricityUsage: room.electricityUsage + Math.floor(Math.random() * 20 - 10),
        waterUsage: room.waterUsage + Math.floor(Math.random() * 4 - 2),
        electricityCost: (room.electricityUsage + Math.floor(Math.random() * 20 - 10)) * room.electricityRate,
        waterCost: (room.waterUsage + Math.floor(Math.random() * 4 - 2)) * room.waterRate,
        totalCost: ((room.electricityUsage + Math.floor(Math.random() * 20 - 10)) * room.electricityRate) + 
                   ((room.waterUsage + Math.floor(Math.random() * 4 - 2)) * room.waterRate),
        status: 'processed'
      }));

      setProcessedData(processedRooms);
      setShowPreview(true);
      setSuccess('Xử lý file thành công! Đã trích xuất dữ liệu điện nước của 10 phòng.');
    } catch (error) {
      setError('Có lỗi xảy ra khi xử lý file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBills = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate bill creation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create bills for each room
      const bills = processedData.map(room => ({
        id: `BILL_${room.roomId}_${Date.now()}`,
        roomId: room.roomId,
        building: room.building,
        zone: room.zone,
        roomType: room.roomType,
        studentCount: room.studentCount,
        type: 'electricity_water',
        amount: room.totalCost,
        electricityUsage: room.electricityUsage,
        waterUsage: room.waterUsage,
        electricityCost: room.electricityCost,
        waterCost: room.waterCost,
        electricityRate: room.electricityRate,
        waterRate: room.waterRate,
        billingPeriod: new Date().toISOString().slice(0, 7), // YYYY-MM format
        status: 'pending',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
        createdBy: user?.id || 'Admin001'
      }));

      // Save bills to localStorage
      const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');
      existingBills.push(...bills);
      localStorage.setItem('bills', JSON.stringify(existingBills));

      setSuccess(`Đã tạo thành công ${bills.length} hóa đơn điện nước!`);
      setShowPreview(false);
      setUploadedFile(null);
    } catch (error) {
      setError('Có lỗi xảy ra khi tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getBuildingOptions = () => {
    const buildings = [...new Set(processedData.map(room => room.building))];
    return buildings;
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
              <h1 className="text-2xl font-bold text-gray-800">Tạo hóa đơn điện nước</h1>
              <p className="text-gray-600 mt-1">Nhập tài liệu điện nước và tự động tạo hóa đơn cho các phòng</p>
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* File Upload Section */}
          {!showPreview && (
            <div className="mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-4">Nhập tài liệu điện nước</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn file tài liệu điện nước
                    </label>
                    <FileUploadButton
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      }
                    >
                      Chọn file Excel/CSV
                    </FileUploadButton>
                    <p className="text-xs text-gray-500 mt-1">
                      Hỗ trợ định dạng: Excel (.xlsx, .xls), CSV (.csv). Kích thước tối đa: 10MB
                    </p>
                  </div>

                  {uploadedFile && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-800 font-medium">
                          Đã chọn: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleProcessFile}
                    disabled={!uploadedFile || loading}
                    loading={loading}
                    loadingText="Đang xử lý..."
                    variant="primary"
                  >
                    Xử lý tài liệu
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-green-800">{success}</span>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {showPreview && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Xem trước dữ liệu đã xử lý</h2>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleCreateBills}
                    loading={loading}
                    loadingText="Đang tạo hóa đơn..."
                  >
                    Tạo hóa đơn
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <select
                    value={filterBuilding}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Tất cả tòa</option>
                    {getBuildingOptions().map(building => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Tổng cộng {filteredData.length} phòng
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Điện (kWh)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nước (m³)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiền điện
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tiền nước
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng cộng
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentData.map((room) => (
                        <tr key={room.roomId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{room.roomId}</div>
                              <div className="text-sm text-gray-500">{room.building}</div>
                              <div className="text-sm text-gray-500">{room.roomType}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room.electricityUsage} kWh</div>
                            <div className="text-sm text-gray-500">
                              {room.previousElectricity} → {room.currentElectricity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{room.waterUsage} m³</div>
                            <div className="text-sm text-gray-500">
                              {room.previousWater} → {room.currentWater}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(room.electricityCost)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(room.electricityRate)}/kWh
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(room.waterCost)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(room.waterRate)}/m³
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {formatCurrency(room.totalCost)}
                            </div>
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
                  totalItems={filteredData.length}
                  showInfo={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectricityWaterBillCreation;
