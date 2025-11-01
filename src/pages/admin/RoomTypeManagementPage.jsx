import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const RoomTypeManagementPage = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', capacity: '', area: '', monthlyFee: '', deposit: '', amenities: [], images: [], status: 'active' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mockRoomTypes = [
    { id: 'RT001', name: 'Phòng đơn', description: 'Phòng ở cho một người với đầy đủ tiện nghi', capacity: 1, area: 15, monthlyFee: 1200000, deposit: 2400000, amenities: ['Giường đơn', 'Bàn học', 'Ghế', 'Tủ quần áo', 'Điều hòa', 'WiFi', 'WC riêng'], images: ['/api/placeholder/300/200'], status: 'active', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', createdBy: 'Admin001', roomCount: 25, occupiedCount: 20, availableCount: 5 },
    { id: 'RT002', name: 'Phòng đôi', description: 'Phòng ở cho hai người với không gian rộng rãi', capacity: 2, area: 25, monthlyFee: 800000, deposit: 1600000, amenities: ['2 Giường đơn', '2 Bàn học', '2 Ghế', '2 Tủ quần áo', 'Điều hòa', 'WiFi', 'WC riêng'], images: ['/api/placeholder/300/200'], status: 'active', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', createdBy: 'Admin001', roomCount: 50, occupiedCount: 45, availableCount: 5 },
    { id: 'RT003', name: 'Phòng ba', description: 'Phòng ở cho ba người với giá cả hợp lý', capacity: 3, area: 30, monthlyFee: 600000, deposit: 1200000, amenities: ['3 Giường đơn', '3 Bàn học', '3 Ghế', '3 Tủ quần áo', 'Điều hòa', 'WiFi', 'WC riêng'], images: ['/api/placeholder/300/200'], status: 'active', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', createdBy: 'Admin001', roomCount: 30, occupiedCount: 28, availableCount: 2 },
    { id: 'RT004', name: 'Phòng VIP', description: 'Phòng cao cấp với đầy đủ tiện nghi hiện đại', capacity: 1, area: 20, monthlyFee: 2000000, deposit: 4000000, amenities: ['Giường đôi', 'Bàn học cao cấp', 'Ghế massage', 'Tủ quần áo lớn', 'Điều hòa', 'WiFi', 'WC riêng', 'Tủ lạnh mini', 'TV'], images: ['/api/placeholder/300/200'], status: 'active', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-02-01T10:00:00Z', createdBy: 'Admin002', roomCount: 10, occupiedCount: 8, availableCount: 2 },
    { id: 'RT005', name: 'Phòng gia đình', description: 'Phòng dành cho gia đình có con nhỏ', capacity: 4, area: 40, monthlyFee: 1500000, deposit: 3000000, amenities: ['2 Giường đôi', 'Bàn học', 'Ghế', 'Tủ quần áo', 'Điều hòa', 'WiFi', 'WC riêng', 'Bếp mini'], images: ['/api/placeholder/300/200'], status: 'inactive', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-15T10:00:00Z', createdBy: 'Admin001', roomCount: 5, occupiedCount: 0, availableCount: 5 }
  ];

  const availableAmenities = ['Giường đơn', 'Giường đôi', 'Bàn học', 'Ghế', 'Tủ quần áo', 'Điều hòa', 'WiFi', 'WC riêng', 'Tủ lạnh mini', 'TV', 'Bếp mini', 'Ghế massage', 'Máy giặt', 'Ban công', 'Két sắt', 'Điện thoại', 'Internet cáp quang'];

  useEffect(() => {
    try {
      const savedRoomTypes = JSON.parse(localStorage.getItem('roomTypes') || '[]');
      const allRoomTypes = [...mockRoomTypes];
      savedRoomTypes.forEach(savedRoomType => { if (!allRoomTypes.find(rt => rt.id === savedRoomType.id)) { allRoomTypes.push(savedRoomType); } });
      setRoomTypes(allRoomTypes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading room types:', error);
      setRoomTypes(mockRoomTypes);
      setLoading(false);
    }
  }, []);

  const totalPages = Math.ceil(roomTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoomTypes = roomTypes.slice(startIndex, endIndex);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleSelectRoomType = (roomTypeId) => setSelectedRoomTypes(prev => prev.includes(roomTypeId) ? prev.filter(id => id !== roomTypeId) : [...prev, roomTypeId]);
  const handleSelectAll = () => { if (selectedRoomTypes.length === currentRoomTypes.length) setSelectedRoomTypes([]); else setSelectedRoomTypes(currentRoomTypes.map(rt => rt.id)); };
  const handleAddNew = () => { setFormData({ name: '', description: '', capacity: '', area: '', monthlyFee: '', deposit: '', amenities: [], images: [], status: 'active' }); setError(''); setSuccess(''); setShowAddModal(true); };
  const handleEdit = (roomType) => { setFormData({ name: roomType.name, description: roomType.description, capacity: roomType.capacity.toString(), area: roomType.area.toString(), monthlyFee: roomType.monthlyFee.toString(), deposit: roomType.deposit.toString(), amenities: roomType.amenities, images: roomType.images, status: roomType.status }); setSelectedRoomType(roomType); setError(''); setSuccess(''); setShowEditModal(true); };
  const handleViewDetail = (roomType) => { setSelectedRoomType(roomType); setShowDetailModal(true); };
  const handleDelete = (roomType) => { setSelectedRoomType(roomType); setShowDeleteModal(true); };
  const handleBulkDelete = () => { if (selectedRoomTypes.length === 0) { alert('Vui lòng chọn ít nhất một loại phòng để xóa'); return; } setShowDeleteModal(true); };

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Vui lòng nhập tên loại phòng'); return false; }
    if (!formData.description.trim()) { setError('Vui lòng nhập mô tả'); return false; }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) { setError('Vui lòng nhập số lượng người hợp lệ'); return false; }
    if (!formData.area || parseFloat(formData.area) <= 0) { setError('Vui lòng nhập diện tích hợp lệ'); return false; }
    if (!formData.monthlyFee || parseInt(formData.monthlyFee) <= 0) { setError('Vui lòng nhập phí thuê hàng tháng hợp lệ'); return false; }
    if (!formData.deposit || parseInt(formData.deposit) <= 0) { setError('Vui lòng nhập tiền cọc hợp lệ'); return false; }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    const newRoomType = { id: showEditModal ? selectedRoomType.id : `RT${Date.now()}`, name: formData.name.trim(), description: formData.description.trim(), capacity: parseInt(formData.capacity), area: parseFloat(formData.area), monthlyFee: parseInt(formData.monthlyFee), deposit: parseInt(formData.deposit), amenities: formData.amenities, images: formData.images, status: formData.status, createdAt: showEditModal ? selectedRoomType.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: showEditModal ? selectedRoomType.createdBy : (user?.id || 'Admin001'), roomCount: showEditModal ? selectedRoomType.roomCount : 0, occupiedCount: showEditModal ? selectedRoomType.occupiedCount : 0, availableCount: showEditModal ? selectedRoomType.availableCount : 0 };
    let updatedRoomTypes;
    if (showEditModal) updatedRoomTypes = roomTypes.map(rt => rt.id === selectedRoomType.id ? newRoomType : rt); else updatedRoomTypes = [...roomTypes, newRoomType];
    setRoomTypes(updatedRoomTypes);
    localStorage.setItem('roomTypes', JSON.stringify(updatedRoomTypes));
    setSuccess(showEditModal ? 'Cập nhật thông tin loại phòng thành công.' : 'Thêm phòng mới thành công.');
    setError('');
    setTimeout(() => { setShowAddModal(false); setShowEditModal(false); setSuccess(''); }, 1500);
  };

  const handleConfirmDelete = () => {
    const roomTypesToDelete = selectedRoomType ? [selectedRoomType.id] : selectedRoomTypes;
    const hasOccupiedRooms = roomTypesToDelete.some(id => { const roomType = roomTypes.find(rt => rt.id === id); return roomType && roomType.occupiedCount > 0; });
    if (hasOccupiedRooms) { alert('Không thể xóa loại phòng có sinh viên đang cư trú'); setShowDeleteModal(false); return; }
    const updatedRoomTypes = roomTypes.filter(rt => !roomTypesToDelete.includes(rt.id));
    setRoomTypes(updatedRoomTypes);
    localStorage.setItem('roomTypes', JSON.stringify(updatedRoomTypes));
    setSuccess('Xóa loại phòng thành công.');
    setSelectedRoomTypes([]);
    setShowDeleteModal(false);
    setTimeout(() => { setSuccess(''); }, 1500);
  };

  const getStatusBadge = (status) => { const statusConfig = { active: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' }, inactive: { text: 'Tạm dừng', color: 'bg-red-100 text-red-800' } }; const config = statusConfig[status] || statusConfig.active; return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>); };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  if (loading) {
    return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý loại phòng</h1>
              <p className="text-gray-600 mt-1">Thêm, sửa, xóa và quản lý các loại phòng ở KTX</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleAddNew} variant="primary" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>Thêm loại phòng mới</Button>
              <Button onClick={onCancel} variant="ghost" size="small" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} />
            </div>
          </div>

          {success && (<div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>)}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-blue-100 rounded-lg"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-blue-600">Tổng loại phòng</p><p className="text-2xl font-bold text-blue-900">{roomTypes.length}</p></div></div></div>
            <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-green-100 rounded-lg"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-green-600">Đang hoạt động</p><p className="text-2xl font-bold text-green-900">{roomTypes.filter(rt => rt.status === 'active').length}</p></div></div></div>
            <div className="bg-yellow-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-yellow-100 rounded-lg"><svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-yellow-600">Tạm dừng</p><p className="text-2xl font-bold text-yellow-900">{roomTypes.filter(rt => rt.status === 'inactive').length}</p></div></div></div>
            <div className="bg-purple-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-purple-100 rounded-lg"><svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-purple-600">Tổng phòng</p><p className="text-2xl font-bold text-purple-900">{roomTypes.reduce((sum, rt) => sum + rt.roomCount, 0)}</p></div></div></div>
          </div>

          {selectedRoomTypes.length > 0 && (
            <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg"><span className="text-blue-800 font-medium">Đã chọn {selectedRoomTypes.length} loại phòng</span><Button onClick={handleBulkDelete} variant="danger">Xóa đã chọn</Button></div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentRoomTypes.map((roomType) => (
              <div key={roomType.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4"><div><h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3><p className="text-sm text-gray-500">{roomType.capacity} người • {roomType.area}m²</p></div><div className="flex items-center space-x-2"><input type="checkbox" checked={selectedRoomTypes.includes(roomType.id)} onChange={() => handleSelectRoomType(roomType.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />{getStatusBadge(roomType.status)}</div></div>
                <div className="space-y-3"><div><p className="text-sm text-gray-600 line-clamp-2">{roomType.description}</p></div><div className="flex justify-between items-center"><div><p className="text-sm font-medium text-gray-900">{formatCurrency(roomType.monthlyFee)}</p><p className="text-xs text-gray-500">/tháng</p></div><div className="text-right"><p className="text-sm text-gray-600">{roomType.roomCount} phòng</p><p className="text-xs text-gray-500">{roomType.availableCount} trống</p></div></div><div className="flex flex-wrap gap-1">{roomType.amenities.slice(0, 3).map((amenity, index) => (<span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{amenity}</span>))}{roomType.amenities.length > 3 && (<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{roomType.amenities.length - 3}</span>)}</div></div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"><div className="flex space-x-2"><button onClick={() => handleViewDetail(roomType)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Chi tiết</button><button onClick={() => handleEdit(roomType)} className="text-green-600 hover:text-green-800 text-sm font-medium">Sửa</button><button onClick={() => handleDelete(roomType)} className="text-red-600 hover:text-red-800 text-sm font-medium">Xóa</button></div></div>
              </div>
            ))}
          </div>

          <div className="mt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} totalItems={roomTypes.length} showInfo={true} /></div>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">{showAddModal ? 'Thêm loại phòng mới' : 'Chỉnh sửa loại phòng'}</h2><button onClick={() => { setShowAddModal(false); setShowEditModal(false); setError(''); }} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            {error && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>)}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng <span className="text-red-500">*</span></label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ví dụ: Phòng đơn, Phòng đôi..." /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa <span className="text-red-500">*</span></label><input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Số người" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Mô tả <span className="text-red-500">*</span></label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Mô tả chi tiết về loại phòng..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²) <span className="text-red-500">*</span></label><input type="number" min="0" step="0.1" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Diện tích" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Phí thuê/tháng (VNĐ) <span className="text-red-500">*</span></label><input type="number" min="0" value={formData.monthlyFee} onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Phí thuê" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ) <span className="text-red-500">*</span></label><input type="number" min="0" value={formData.deposit} onChange={(e) => setFormData({...formData, deposit: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Tiền cọc" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Tiện nghi</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{availableAmenities.map((amenity) => (<label key={amenity} className="flex items-center space-x-2"><input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={() => setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity] }))} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-sm text-gray-700">{amenity}</span></label>))}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><option value="active">Hoạt động</option><option value="inactive">Tạm dừng</option></select></div>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t"><Button onClick={() => { setShowAddModal(false); setShowEditModal(false); setError(''); }} variant="outline">Hủy</Button><Button onClick={handleSave} variant="primary">{showAddModal ? 'Thêm mới' : 'Lưu thay đổi'}</Button></div>
          </div>
        </div>
      )}

      {showDetailModal && selectedRoomType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">Chi tiết loại phòng</h2><button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3><div className="space-y-2"><div><span className="font-medium">Tên:</span> {selectedRoomType.name}</div><div><span className="font-medium">Mô tả:</span> {selectedRoomType.description}</div><div><span className="font-medium">Sức chứa:</span> {selectedRoomType.capacity} người</div><div><span className="font-medium">Diện tích:</span> {selectedRoomType.area}m²</div><div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedRoomType.status)}</div></div></div>
              <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin giá cả</h3><div className="space-y-2"><div><span className="font-medium">Phí thuê/tháng:</span> {formatCurrency(selectedRoomType.monthlyFee)}</div><div><span className="font-medium">Tiền cọc:</span> {formatCurrency(selectedRoomType.deposit)}</div></div></div>
              <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thống kê phòng</h3><div className="space-y-2"><div><span className="font-medium">Tổng số phòng:</span> {selectedRoomType.roomCount}</div><div><span className="font-medium">Đã thuê:</span> {selectedRoomType.occupiedCount}</div><div><span className="font-medium">Còn trống:</span> {selectedRoomType.availableCount}</div></div></div>
              <div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Tiện nghi</h3><div className="grid grid-cols-2 gap-2">{selectedRoomType.amenities.map((amenity, index) => (<div key={index} className="flex items-center space-x-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-sm">{amenity}</span></div>))}</div></div>
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hệ thống</h3><div className="grid grid-cols-2 gap-4"><div><span className="font-medium">Ngày tạo:</span> {formatDate(selectedRoomType.createdAt)}</div><div><span className="font-medium">Ngày cập nhật:</span> {formatDate(selectedRoomType.updatedAt)}</div><div><span className="font-medium">Người tạo:</span> {selectedRoomType.createdBy}</div></div></div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-gray-800">Xác nhận xóa</h2><button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
            <p className="text-gray-600 mb-6">{selectedRoomType ? `Bạn có chắc chắn muốn xóa loại phòng "${selectedRoomType.name}"?` : `Bạn có chắc chắn muốn xóa ${selectedRoomTypes.length} loại phòng đã chọn?`}</p>
            <div className="flex items-center justify-end space-x-4"><Button onClick={() => setShowDeleteModal(false)} variant="outline">Hủy</Button><Button onClick={handleConfirmDelete} variant="danger">Xóa</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeManagementPage;
