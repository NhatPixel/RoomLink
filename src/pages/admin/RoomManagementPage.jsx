import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';

const RoomManagementPage = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterZone, setFilterZone] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({ roomNumber: '', building: '', zone: '', floor: '', roomType: '', capacity: '', monthlyFee: '', description: '', amenities: [], status: 'available' });

  const mockRooms = [
    { id: 'ROOM001', roomNumber: 'A101', building: 'Tòa A', zone: 'Khu A', floor: 1, roomType: 'Phòng đôi', capacity: 2, monthlyFee: 800000, description: 'Phòng đôi tiện nghi, có điều hòa', amenities: ['Điều hòa', 'WiFi', 'Tủ quần áo', 'Bàn học'], status: 'available', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', currentResidents: [] },
    { id: 'ROOM002', roomNumber: 'A102', building: 'Tòa A', zone: 'Khu A', floor: 1, roomType: 'Phòng đơn', capacity: 1, monthlyFee: 1200000, description: 'Phòng đơn riêng tư, đầy đủ tiện nghi', amenities: ['Điều hòa', 'WiFi', 'Tủ quần áo', 'Bàn học', 'Tủ lạnh mini'], status: 'occupied', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', currentResidents: ['SV001'] },
    { id: 'ROOM003', roomNumber: 'A201', building: 'Tòa A', zone: 'Khu A', floor: 2, roomType: 'Phòng đôi', capacity: 2, monthlyFee: 800000, description: 'Phòng đôi view đẹp', amenities: ['Điều hòa', 'WiFi', 'Tủ quần áo', 'Bàn học', 'Ban công'], status: 'maintenance', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', currentResidents: [] },
  ];

  const zones = ['Khu A', 'Khu B', 'Khu C'];
  const roomTypes = ['Phòng đơn', 'Phòng đôi', 'Phòng ba', 'Phòng bốn'];
  const statuses = ['available', 'occupied', 'maintenance', 'reserved'];
  const amenities = ['Điều hòa', 'WiFi', 'Tủ quần áo', 'Bàn học', 'Tủ lạnh mini', 'Máy nước nóng', 'Ban công', 'Tủ lạnh', 'TV'];

  useEffect(() => {
    try {
      const savedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
      const allRooms = [...mockRooms];
      savedRooms.forEach(savedRoom => { if (!allRooms.find(room => room.id === savedRoom.id)) { allRooms.push(savedRoom); } });
      setRooms(allRooms);
      setLoading(false);
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms(mockRooms);
      setLoading(false);
    }
  }, []);

  const filteredRooms = rooms.filter(room => (filterStatus === 'all' || room.status === filterStatus) && (filterZone === 'all' || room.zone === filterZone));
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);
  const handlePageChange = (page) => setCurrentPage(page);
  const handleFilterChange = (type, value) => { if (type === 'status') setFilterStatus(value); else if (type === 'zone') setFilterZone(value); setCurrentPage(1); };
  const handleSelectRoom = (roomId) => setSelectedRooms(prev => prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]);
  const handleSelectAll = () => { if (selectedRooms.length === currentRooms.length) setSelectedRooms([]); else setSelectedRooms(currentRooms.map(room => room.id)); };
  const handleAddRoom = () => { setFormData({ roomNumber: '', building: '', zone: '', floor: '', roomType: '', capacity: '', monthlyFee: '', description: '', amenities: [], status: 'available' }); setShowAddModal(true); };
  const handleEditRoom = (room) => { setFormData({ roomNumber: room.roomNumber, building: room.building, zone: room.zone, floor: room.floor.toString(), roomType: room.roomType, capacity: room.capacity.toString(), monthlyFee: room.monthlyFee.toString(), description: room.description, amenities: room.amenities, status: room.status }); setSelectedRoom(room); setShowEditModal(true); };
  const handleViewDetail = (room) => { setSelectedRoom(room); setShowDetailModal(true); };
  const handleDeleteRoom = (room) => { setSelectedRoom(room); setShowDeleteModal(true); };
  const handleDeleteSelected = () => { if (selectedRooms.length === 0) { alert('Vui lòng chọn ít nhất một phòng để xóa'); return; } const roomsWithResidents = selectedRooms.filter(roomId => { const room = rooms.find(r => r.id === roomId); return room && room.currentResidents.length > 0; }); if (roomsWithResidents.length > 0) { alert('Không thể xóa phòng đang có sinh viên cư trú'); return; } const updatedRooms = rooms.filter(room => !selectedRooms.includes(room.id)); setRooms(updatedRooms); localStorage.setItem('rooms', JSON.stringify(updatedRooms)); alert(`Đã xóa thành công ${selectedRooms.length} phòng!`); setSelectedRooms([]); };
  const handleSaveRoom = () => {
    if (!formData.roomNumber.trim() || !formData.building.trim() || !formData.zone || !formData.floor || !formData.roomType || !formData.capacity || !formData.monthlyFee) { alert('Vui lòng điền đầy đủ thông tin bắt buộc'); return; }
    const existingRoom = rooms.find(room => room.roomNumber === formData.roomNumber && room.building === formData.building && (!selectedRoom || room.id !== selectedRoom.id));
    if (existingRoom) { alert('Số phòng này đã tồn tại trong tòa nhà'); return; }
    const roomData = { id: selectedRoom ? selectedRoom.id : `ROOM${Date.now()}`, roomNumber: formData.roomNumber, building: formData.building, zone: formData.zone, floor: parseInt(formData.floor), roomType: formData.roomType, capacity: parseInt(formData.capacity), monthlyFee: parseInt(formData.monthlyFee), description: formData.description, amenities: formData.amenities, status: formData.status, createdAt: selectedRoom ? selectedRoom.createdAt : new Date().toISOString(), updatedAt: new Date().toISOString(), currentResidents: selectedRoom ? selectedRoom.currentResidents : [] };
    const updatedRooms = selectedRoom ? rooms.map(room => room.id === selectedRoom.id ? roomData : room) : [...rooms, roomData];
    setRooms(updatedRooms); localStorage.setItem('rooms', JSON.stringify(updatedRooms)); alert(selectedRoom ? 'Cập nhật thông tin phòng thành công!' : 'Thêm phòng mới thành công!'); setShowAddModal(false); setShowEditModal(false); setSelectedRoom(null);
  };
  const handleDeleteConfirm = () => { if (selectedRoom.currentResidents.length > 0) { alert('Không thể xóa phòng đang có sinh viên cư trú'); setShowDeleteModal(false); return; } const updatedRooms = rooms.filter(room => room.id !== selectedRoom.id); setRooms(updatedRooms); localStorage.setItem('rooms', JSON.stringify(updatedRooms)); alert('Xóa phòng thành công!'); setShowDeleteModal(false); setSelectedRoom(null); };
  const getStatusBadge = (status) => { const statusConfig = { available: { text: 'Trống', color: 'bg-green-100 text-green-800' }, occupied: { text: 'Có người ở', color: 'bg-blue-100 text-blue-800' }, maintenance: { text: 'Bảo trì', color: 'bg-yellow-100 text-yellow-800' }, reserved: { text: 'Đã đặt', color: 'bg-purple-100 text-purple-800' } }; const config = statusConfig[status] || statusConfig.available; return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>); };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (loading) { return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>); }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Quản lý phòng ở</h1>
              <p className="text-gray-600 mt-1">Quản lý thông tin các phòng trong ký túc xá</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleAddRoom} variant="primary" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>Thêm phòng mới</Button>
              <Button onClick={onCancel} variant="ghost" size="small" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} />
            </div>
          </div>

          {selectedRooms.length > 0 && (<div className="flex items-center space-x-4 mb-6 p-4 bg-red-50 rounded-lg"><span className="text-red-800 font-medium">Đã chọn {selectedRooms.length} phòng</span><Button onClick={handleDeleteSelected} variant="danger">Xóa đã chọn</Button></div>)}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select value={filterStatus} onChange={(e) => handleFilterChange('status', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><option value="all">Tất cả trạng thái</option><option value="available">Trống</option><option value="occupied">Có người ở</option><option value="maintenance">Bảo trì</option><option value="reserved">Đã đặt</option></select>
              <select value={filterZone} onChange={(e) => handleFilterChange('zone', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><option value="all">Tất cả khu</option>{zones.map(zone => (<option key={zone} value={zone}>{zone}</option>))}</select>
            </div>
            <div className="flex items-center space-x-2"><span className="text-sm text-gray-600">Tổng cộng {filteredRooms.length} phòng</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentRooms.map((room) => (
              <div key={room.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4"><div><h3 className="text-lg font-semibold text-gray-900">{room.roomNumber}</h3><p className="text-sm text-gray-500">{room.building} - {room.zone}</p></div><div className="flex items-center space-x-2"><input type="checkbox" checked={selectedRooms.includes(room.id)} onChange={() => handleSelectRoom(room.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />{getStatusBadge(room.status)}</div></div>
                <div className="space-y-2 mb-4"><div className="flex justify-between"><span className="text-sm text-gray-600">Tầng:</span><span className="text-sm font-medium">{room.floor}</span></div><div className="flex justify-between"><span className="text-sm text-gray-600">Loại:</span><span className="text-sm font-medium">{room.roomType}</span></div><div className="flex justify-between"><span className="text-sm text-gray-600">Sức chứa:</span><span className="text-sm font-medium">{room.capacity} người</span></div><div className="flex justify-between"><span className="text-sm text-gray-600">Phí/tháng:</span><span className="text-sm font-medium text-green-600">{formatCurrency(room.monthlyFee)}</span></div></div>
                <div className="flex items-center justify-between"><div className="flex space-x-2"><Button onClick={() => handleViewDetail(room)} variant="outline" size="small" className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">Chi tiết</Button><Button onClick={() => handleEditRoom(room)} variant="outline" size="small" className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200">Sửa</Button><Button onClick={() => handleDeleteRoom(room)} variant="outline" size="small" className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200">Xóa</Button></div></div>
              </div>
            ))}
          </div>

          <div className="mt-6"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} totalItems={filteredRooms.length} showInfo={true} /></div>
        </div>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">{showAddModal ? 'Thêm phòng mới' : 'Chỉnh sửa phòng'}</h2><button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedRoom(null); }} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><form onSubmit={(e) => { e.preventDefault(); handleSaveRoom(); }} className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Số phòng *</label><input type="text" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="VD: A101" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà *</label><input type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="VD: Tòa A" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Khu *</label><select value={formData.zone} onChange={(e) => setFormData({...formData, zone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><option value="">Chọn khu</option>{zones.map(zone => (<option key={zone} value={zone}>{zone}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tầng *</label><input type="number" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="1" max="10" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng *</label><select value={formData.roomType} onChange={(e) => setFormData({...formData, roomType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"><option value="">Chọn loại phòng</option>{roomTypes.map(type => (<option key={type} value={type}>{type}</option>))}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa *</label><input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="1" max="10" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phí thuê/tháng *</label><input type="number" value={formData.monthlyFee} onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">{statuses.map(status => (<option key={status} value={status}>{status === 'available' ? 'Trống' : status === 'occupied' ? 'Có người ở' : status === 'maintenance' ? 'Bảo trì' : 'Đã đặt'}</option>))}</select></div></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Mô tả về phòng..." /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label><div className="grid grid-cols-2 md:grid-cols-3 gap-2">{amenities.map(amenity => (<label key={amenity} className="flex items-center"><input type="checkbox" checked={formData.amenities.includes(amenity)} onChange={(e) => { if (e.target.checked) { setFormData({...formData, amenities: [...formData.amenities, amenity]}); } else { setFormData({...formData, amenities: formData.amenities.filter(a => a !== amenity)}); } }} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="ml-2 text-sm">{amenity}</span></label>))}</div></div><div className="flex items-center justify-end space-x-4 pt-6 border-t"><Button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedRoom(null); }} variant="outline">Hủy</Button><Button type="submit" variant="primary">{showAddModal ? 'Thêm phòng' : 'Lưu thay đổi'}</Button></div></form></div></div>
      )}

      {showDetailModal && selectedRoom && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-gray-800">Chi tiết phòng {selectedRoom.roomNumber}</h2><button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3><div className="space-y-2"><div><span className="font-medium">Số phòng:</span> {selectedRoom.roomNumber}</div><div><span className="font-medium">Tòa nhà:</span> {selectedRoom.building}</div><div><span className="font-medium">Khu:</span> {selectedRoom.zone}</div><div><span className="font-medium">Tầng:</span> {selectedRoom.floor}</div><div><span className="font-medium">Loại phòng:</span> {selectedRoom.roomType}</div><div><span className="font-medium">Sức chứa:</span> {selectedRoom.capacity} người</div><div><span className="font-medium">Phí/tháng:</span> {formatCurrency(selectedRoom.monthlyFee)}</div><div><span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedRoom.status)}</div></div></div><div className="bg-gray-50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-gray-800 mb-4">Mô tả và tiện nghi</h3><div className="space-y-2"><div><span className="font-medium">Mô tả:</span> {selectedRoom.description}</div><div><span className="font-medium">Tiện nghi:</span><div className="mt-2 flex flex-wrap gap-2">{selectedRoom.amenities.map(amenity => (<span key={amenity} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{amenity}</span>))}</div></div></div></div><div className="bg-gray-50 p-4 rounded-lg md:col-span-2"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cư dân</h3><div className="space-y-2"><div><span className="font-medium">Số cư dân hiện tại:</span> {selectedRoom.currentResidents.length}</div><div><span className="font-medium">Sức chứa:</span> {selectedRoom.capacity}</div><div><span className="font-medium">Tỷ lệ sử dụng:</span> <span className={`ml-2 px-2 py-1 rounded text-sm ${(selectedRoom.currentResidents.length / selectedRoom.capacity) >= 0.8 ? 'bg-red-100 text-red-800' : (selectedRoom.currentResidents.length / selectedRoom.capacity) >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{Math.round((selectedRoom.currentResidents.length / selectedRoom.capacity) * 100)}%</span></div></div></div><div className="bg-gray-50 p-4 rounded-lg md:col-span-2"><h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin hệ thống</h3><div className="space-y-2"><div><span className="font-medium">Ngày tạo:</span> {new Date(selectedRoom.createdAt).toLocaleDateString('vi-VN')}</div><div><span className="font-medium">Cập nhật lần cuối:</span> {new Date(selectedRoom.updatedAt).toLocaleDateString('vi-VN')}</div></div></div></div></div></div>)}

      {showDeleteModal && selectedRoom && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 max-w-md w-full mx-4"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-800">Xác nhận xóa phòng</h2><button onClick={() => setShowDeleteModal(false)} className="text-gray-500 hover:text-gray-700"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div><div className="mb-6"><p className="text-gray-600 mb-4">Bạn có chắc chắn muốn xóa phòng <strong>{selectedRoom.roomNumber}</strong> không?</p>{selectedRoom.currentResidents.length > 0 && (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><div className="flex items-center"><svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg><span className="text-red-800 font-medium">Không thể xóa phòng đang có sinh viên cư trú</span></div></div>)}</div><div className="flex items-center justify-end space-x-4"><Button onClick={() => setShowDeleteModal(false)} variant="outline">Hủy</Button><Button onClick={handleDeleteConfirm} disabled={selectedRoom.currentResidents.length > 0} variant="danger">Xóa phòng</Button></div></div></div>)}
    </div>
  );
};

export default RoomManagementPage;
