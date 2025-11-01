import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import RejectionModal from '../../components/ui/RejectionModal';

const RoomRegistrationApprovalPage = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterConfidence, setFilterConfidence] = useState('all');

  const mockRegistrationRequests = [
    { id: 1, studentId: 'SV001', studentName: 'Nguyễn Văn An', studentEmail: 'an.nguyen@student.edu.vn', studentPhone: '0123456789', studentIdNumber: '123456789', studentClass: 'CNTT2021A', studentMajor: 'Công nghệ thông tin', studentYear: 'Năm 3', preferredRoom: 'A101', preferredBuilding: 'Tòa A', preferredZone: 'Khu A', preferredRoomType: 'Phòng đôi', alternativeRoom: 'A102', registrationDate: '2024-05-15T10:30:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: false, verified: false }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'normal', aiConfidence: 95, aiAnalysis: { documentCompleteness: 90, informationAccuracy: 95, eligibilityScore: 100, riskFactors: [], recommendations: ['Đơn đăng ký hợp lệ, có thể duyệt ngay'] }, aiProcessedAt: '2024-05-15T10:35:00Z' },
    { id: 2, studentId: 'SV002', studentName: 'Trần Thị Bình', studentEmail: 'binh.tran@student.edu.vn', studentPhone: '0987654321', studentIdNumber: '987654321', studentClass: 'KT2021B', studentMajor: 'Kế toán', studentYear: 'Năm 3', preferredRoom: 'B205', preferredBuilding: 'Tòa B', preferredZone: 'Khu B', preferredRoomType: 'Phòng đơn', alternativeRoom: 'B206', registrationDate: '2024-05-20T14:15:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 2000000, depositFee: 4000000, totalFee: 6000000, priority: 'high', aiConfidence: 88, aiAnalysis: { documentCompleteness: 100, informationAccuracy: 85, eligibilityScore: 90, riskFactors: ['Thông tin CMND cần xác minh thêm'], recommendations: ['Kiểm tra lại thông tin CMND trước khi duyệt'] }, aiProcessedAt: '2024-05-20T14:20:00Z' },
    { id: 3, studentId: 'SV003', studentName: 'Lê Văn Cường', studentEmail: 'cuong.le@student.edu.vn', studentPhone: '0369852147', studentIdNumber: '456789123', studentClass: 'QTKD2021C', studentMajor: 'Quản trị kinh doanh', studentYear: 'Năm 3', preferredRoom: 'C301', preferredBuilding: 'Tòa C', preferredZone: 'Khu C', preferredRoomType: 'Phòng đôi', alternativeRoom: 'C302', registrationDate: '2024-05-25T09:45:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: false, verified: false }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: false, verified: false }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'normal', aiConfidence: 72, aiAnalysis: { documentCompleteness: 60, informationAccuracy: 85, eligibilityScore: 80, riskFactors: ['Thiếu giấy khai sinh', 'Thiếu một số giấy tờ phụ'], recommendations: ['Yêu cầu bổ sung giấy khai sinh trước khi duyệt'] }, aiProcessedAt: '2024-05-25T09:50:00Z' },
    { id: 4, studentId: 'SV004', studentName: 'Phạm Thị Dung', studentEmail: 'dung.pham@student.edu.vn', studentPhone: '0741258963', studentIdNumber: '789123456', studentClass: 'NN2021D', studentMajor: 'Ngôn ngữ Anh', studentYear: 'Năm 3', preferredRoom: 'A205', preferredBuilding: 'Tòa A', preferredZone: 'Khu A', preferredRoomType: 'Phòng đôi', alternativeRoom: 'A206', registrationDate: '2024-05-28T16:20:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'urgent', aiConfidence: 92, aiAnalysis: { documentCompleteness: 100, informationAccuracy: 90, eligibilityScore: 95, riskFactors: [], recommendations: ['Đơn đăng ký hợp lệ, có thể duyệt ngay'] }, aiProcessedAt: '2024-05-28T16:25:00Z' },
    { id: 5, studentId: 'SV005', studentName: 'Hoàng Văn Em', studentEmail: 'em.hoang@student.edu.vn', studentPhone: '0852147369', studentIdNumber: '321654987', studentClass: 'DL2021E', studentMajor: 'Du lịch', studentYear: 'Năm 3', preferredRoom: 'B301', preferredBuilding: 'Tòa B', preferredZone: 'Khu B', preferredRoomType: 'Phòng đơn', alternativeRoom: 'B302', registrationDate: '2024-05-30T11:30:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: false, verified: false }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 2000000, depositFee: 4000000, totalFee: 6000000, priority: 'normal', aiConfidence: 78, aiAnalysis: { documentCompleteness: 80, informationAccuracy: 85, eligibilityScore: 75, riskFactors: ['Thiếu ảnh 3x4'], recommendations: ['Yêu cầu bổ sung ảnh 3x4 trước khi duyệt'] }, aiProcessedAt: '2024-05-30T11:35:00Z' },
    { id: 6, studentId: 'SV006', studentName: 'Vũ Thị Phương', studentEmail: 'phuong.vu@student.edu.vn', studentPhone: '0963258741', studentIdNumber: '654987321', studentClass: 'MT2021F', studentMajor: 'Marketing', studentYear: 'Năm 3', preferredRoom: 'C102', preferredBuilding: 'Tòa C', preferredZone: 'Khu C', preferredRoomType: 'Phòng đôi', alternativeRoom: 'C103', registrationDate: '2024-06-01T09:15:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'high', aiConfidence: 96, aiAnalysis: { documentCompleteness: 100, informationAccuracy: 95, eligibilityScore: 100, riskFactors: [], recommendations: ['Đơn đăng ký hoàn hảo, có thể duyệt ngay'] }, aiProcessedAt: '2024-06-01T09:20:00Z' },
    { id: 7, studentId: 'SV007', studentName: 'Đặng Văn Giang', studentEmail: 'giang.dang@student.edu.vn', studentPhone: '0789456123', studentIdNumber: '147258369', studentClass: 'TC2021G', studentMajor: 'Tài chính', studentYear: 'Năm 3', preferredRoom: 'A308', preferredBuilding: 'Tòa A', preferredZone: 'Khu A', preferredRoomType: 'Phòng đơn', alternativeRoom: 'A309', registrationDate: '2024-06-02T14:45:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: false, verified: false }], monthlyFee: 2000000, depositFee: 4000000, totalFee: 6000000, priority: 'normal', aiConfidence: 85, aiAnalysis: { documentCompleteness: 80, informationAccuracy: 90, eligibilityScore: 85, riskFactors: ['Thiếu một số giấy tờ phụ'], recommendations: ['Có thể duyệt nhưng nên yêu cầu bổ sung giấy tờ phụ'] }, aiProcessedAt: '2024-06-02T14:50:00Z' },
    { id: 8, studentId: 'SV008', studentName: 'Ngô Thị Hoa', studentEmail: 'hoa.ngo@student.edu.vn', studentPhone: '0912345678', studentIdNumber: '369258147', studentClass: 'QT2021H', studentMajor: 'Quản trị', studentYear: 'Năm 3', preferredRoom: 'B405', preferredBuilding: 'Tòa B', preferredZone: 'Khu B', preferredRoomType: 'Phòng đôi', alternativeRoom: 'B406', registrationDate: '2024-06-03T16:20:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'urgent', aiConfidence: 94, aiAnalysis: { documentCompleteness: 100, informationAccuracy: 95, eligibilityScore: 90, riskFactors: [], recommendations: ['Đơn đăng ký hợp lệ, có thể duyệt ngay'] }, aiProcessedAt: '2024-06-03T16:25:00Z' },
    { id: 9, studentId: 'SV009', studentName: 'Lý Văn Khoa', studentEmail: 'khoa.ly@student.edu.vn', studentPhone: '0823456789', studentIdNumber: '258147369', studentClass: 'KT2021I', studentMajor: 'Kinh tế', studentYear: 'Năm 3', preferredRoom: 'C203', preferredBuilding: 'Tòa C', currentZone: 'Khu C', preferredRoomType: 'Phòng đơn', alternativeRoom: 'C204', registrationDate: '2024-06-04T10:30:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: false, verified: false }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: false, verified: false }], monthlyFee: 2000000, depositFee: 4000000, totalFee: 6000000, priority: 'normal', aiConfidence: 65, aiAnalysis: { documentCompleteness: 60, informationAccuracy: 80, eligibilityScore: 70, riskFactors: ['Thiếu giấy khai sinh', 'Thiếu giấy tờ phụ'], recommendations: ['Cần bổ sung đầy đủ giấy tờ trước khi duyệt'] }, aiProcessedAt: '2024-06-04T10:35:00Z' },
    { id: 10, studentId: 'SV010', studentName: 'Trịnh Thị Lan', studentEmail: 'lan.trinh@student.edu.vn', studentPhone: '0934567890', studentIdNumber: '741852963', studentClass: 'NN2021J', studentMajor: 'Ngôn ngữ Nhật', studentYear: 'Năm 3', preferredRoom: 'A501', preferredBuilding: 'Tòa A', preferredZone: 'Khu A', preferredRoomType: 'Phòng đôi', alternativeRoom: 'A502', registrationDate: '2024-06-05T13:15:00Z', status: 'pending', documents: [{ name: 'Giấy xác nhận sinh viên', uploaded: true, verified: true }, { name: 'CMND/CCCD', uploaded: true, verified: true }, { name: 'Giấy khai sinh', uploaded: true, verified: true }, { name: 'Ảnh 3x4', uploaded: true, verified: true }, { name: 'Giấy tờ khác', uploaded: true, verified: true }], monthlyFee: 1500000, depositFee: 3000000, totalFee: 4500000, priority: 'high', aiConfidence: 91, aiAnalysis: { documentCompleteness: 100, informationAccuracy: 90, eligibilityScore: 95, riskFactors: [], recommendations: ['Đơn đăng ký hợp lệ, có thể duyệt ngay'] }, aiProcessedAt: '2024-06-05T13:20:00Z' }
  ];

  useEffect(() => {
    const savedRequests = JSON.parse(localStorage.getItem('roomRegistrationRequests') || '[]');
    const allRequests = [...savedRequests, ...mockRegistrationRequests];
    const uniqueRequests = allRequests.filter((request, index, self) => index === self.findIndex(r => r.studentId === request.studentId && r.registrationDate === request.registrationDate));
    setRegistrationRequests(uniqueRequests);
    setLoading(false);
  }, []);

  const filteredRequests = registrationRequests.filter(request => {
    let statusMatch = true;
    let confidenceMatch = true;
    if (filterStatus !== 'all') statusMatch = request.status === filterStatus;
    if (filterConfidence !== 'all') {
      switch (filterConfidence) {
        case 'high': confidenceMatch = request.aiConfidence >= 90; break;
        case 'medium': confidenceMatch = request.aiConfidence >= 70 && request.aiConfidence < 90; break;
        case 'low': confidenceMatch = request.aiConfidence < 70; break;
        default: confidenceMatch = true;
      }
    }
    return statusMatch && confidenceMatch;
  });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page) => { setCurrentPage(page); setSelectedRequests([]); };
  const handleFilterChange = (status) => { setFilterStatus(status); setCurrentPage(1); setSelectedRequests([]); };
  const handleConfidenceFilterChange = (confidence) => { setFilterConfidence(confidence); setCurrentPage(1); setSelectedRequests([]); };
  const handleSelectRequest = (requestId) => { setSelectedRequests(prev => prev.includes(requestId) ? prev.filter(id => id !== requestId) : [...prev, requestId]); };
  const handleSelectAll = () => { if (selectedRequests.length === currentRequests.length) setSelectedRequests([]); else setSelectedRequests(currentRequests.map(req => req.id)); };
  const handleViewDetail = (request) => { setSelectedRequestDetail(request); setShowDetailModal(true); };

  const handleApproveRequests = async () => {
    if (selectedRequests.length === 0) { setError('Vui lòng chọn ít nhất một đơn để duyệt'); return; }
    setActionLoading(true); setError(''); setSuccess('');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const updatedRequests = registrationRequests.map(request => selectedRequests.includes(request.id) ? { ...request, status: 'approved', approvedBy: user.name, approvedAt: new Date().toISOString(), approvedByUserId: user.id } : request);
      const approvedRequests = updatedRequests.filter(req => selectedRequests.includes(req.id));
      const newBills = approvedRequests.map(request => ({ id: `BILL_REG_${request.id}_${Date.now()}`, userId: request.studentId, userName: request.studentName, userEmail: request.studentEmail, type: 'registration_fee', description: `Phí đăng ký KTX - Phòng ${request.preferredRoom}`, amount: request.totalFee, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'unpaid', createdAt: new Date().toISOString(), registrationRequestId: request.id, roomNumber: request.preferredRoom, roomType: request.preferredRoomType }));
      const existingBills = JSON.parse(localStorage.getItem('bills') || '[]');
      localStorage.setItem('bills', JSON.stringify([...existingBills, ...newBills]));
      localStorage.setItem('roomRegistrationRequests', JSON.stringify(updatedRequests));
      setRegistrationRequests(updatedRequests);
      setSelectedRequests([]);
      setSuccess(`Đã duyệt thành công ${selectedRequests.length} đơn đăng ký và tạo hóa đơn thanh toán!`);
    } catch (error) {
      setError('Có lỗi xảy ra khi duyệt đơn. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequests = async () => {
    if (selectedRequests.length === 0) { setError('Vui lòng chọn ít nhất một đơn để từ chối'); return; }
    setRejectionTarget('selected'); setShowRejectionModal(true);
  };

  const handleConfirmRejection = async (reason) => {
    setActionLoading(true); setError(''); setSuccess('');
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const updatedRequests = registrationRequests.map(request => selectedRequests.includes(request.id) ? { ...request, status: 'rejected', rejectedBy: user.name, rejectedAt: new Date().toISOString(), rejectedByUserId: user.id, rejectionReason: reason } : request);
      localStorage.setItem('roomRegistrationRequests', JSON.stringify(updatedRequests));
      setRegistrationRequests(updatedRequests);
      setSelectedRequests([]);
      setSuccess(`Đã từ chối ${selectedRequests.length} đơn đăng ký!`);
    } catch (error) {
      setError('Có lỗi xảy ra khi từ chối đơn. Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const getPriorityColor = (priority) => priority === 'urgent' ? 'text-red-600 bg-red-100' : priority === 'high' ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100';
  const getPriorityText = (priority) => priority === 'urgent' ? 'Khẩn cấp' : priority === 'high' ? 'Cao' : 'Bình thường';
  const getConfidenceColor = (confidence) => confidence >= 90 ? 'text-green-600 bg-green-100' : confidence >= 70 ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
  const getConfidenceText = (confidence) => confidence >= 90 ? 'Cao' : confidence >= 70 ? 'Trung bình' : 'Thấp';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Duyệt đơn đăng ký KTX</h1>
              <p className="text-gray-600 mt-1">Quản lý và duyệt các đơn đăng ký ký túc xá của sinh viên với hỗ trợ AI</p>
            </div>
            <Button onClick={onCancel} variant="ghost" size="small" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} />
          </div>

          {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>)}
          {success && (<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">{success}</div>)}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-blue-100 rounded-lg"><svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-blue-600">Tổng đơn</p><p className="text-2xl font-bold text-blue-900">{registrationRequests.length}</p></div></div></div>
            <div className="bg-yellow-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-yellow-100 rounded-lg"><svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-yellow-600">Chờ duyệt</p><p className="text-2xl font-bold text-yellow-900">{registrationRequests.filter(req => req.status === 'pending').length}</p></div></div></div>
            <div className="bg-green-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-green-100 rounded-lg"><svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-green-600">Đã duyệt</p><p className="text-2xl font-bold text-green-900">{registrationRequests.filter(req => req.status === 'approved').length}</p></div></div></div>
            <div className="bg-red-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-red-100 rounded-lg"><svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-red-600">Từ chối</p><p className="text-2xl font-bold text-red-900">{registrationRequests.filter(req => req.status === 'rejected').length}</p></div></div></div>
            <div className="bg-purple-50 p-4 rounded-lg"><div className="flex items-center"><div className="p-2 bg-purple-100 rounded-lg"><svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg></div><div className="ml-4"><p className="text-sm font-medium text-purple-600">AI Tin cậy cao</p><p className="text-2xl font-bold text-purple-900">{registrationRequests.filter(req => req.aiConfidence >= 90).length}</p></div></div></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
              <select value={filterStatus} onChange={(e) => handleFilterChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
              <label className="text-sm font-medium text-gray-700">Độ tin cậy AI:</label>
              <select value={filterConfidence} onChange={(e) => handleConfidenceFilterChange(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">Tất cả</option>
                <option value="high">Cao (≥90%)</option>
                <option value="medium">Trung bình (70-89%)</option>
                <option value="low">Thấp (&lt;70%)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2"><span className="text-sm text-gray-600">Tổng cộng {filteredRequests.length} đơn</span></div>
          </div>

          {selectedRequests.length > 0 && (
            <div className="flex items-center space-x-4 mb-6 p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">Đã chọn {selectedRequests.length} đơn</span>
              <Button onClick={handleApproveRequests} variant="success" loading={actionLoading} loadingText="Đang duyệt...">Duyệt đã chọn</Button>
              <Button onClick={handleRejectRequests} variant="danger" loading={actionLoading} loadingText="Đang từ chối...">Từ chối đã chọn</Button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr>
                  <th className="px-6 py-3 text-left"><input type="checkbox" checked={selectedRequests.length === currentRequests.length && currentRequests.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sinh viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian ở</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phí dự kiến</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Độ tin cậy AI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><input type="checkbox" checked={selectedRequests.includes(request.id)} onChange={() => handleSelectRequest(request.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div><div className="text-sm font-medium text-gray-900">{request.studentName}</div><div className="text-sm text-gray-500">{request.studentId}</div><div className="text-sm text-gray-500">{request.studentEmail}</div></div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div><div className="text-sm font-medium text-gray-900">{request.preferredRoom}</div><div className="text-sm text-gray-500">{request.preferredBuilding}</div><div className="text-sm text-gray-500">{request.preferredRoomType}</div></div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div><div className="text-sm font-medium text-gray-900">{request.duration} tháng</div><div className="text-sm text-gray-500">Từ: {formatDate(request.startDate)}</div><div className="text-sm text-gray-500">Đến: {formatDate(request.endDate)}</div></div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{formatCurrency(request.estimatedFee)}</div><div className="text-sm text-gray-500">{request.durationLabel}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center space-x-2"><div className={`w-3 h-3 rounded-full ${getConfidenceColor(request.aiConfidence)}`}></div><span className={`text-sm font-medium ${getConfidenceColor(request.aiConfidence)}`}>{request.aiConfidence}%</span></div><div className="text-sm text-gray-500">{getConfidenceText(request.aiConfidence)}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{formatDate(request.registrationDate)}</div><div className="text-sm text-gray-500"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>{getPriorityText(request.priority)}</span></div></td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{request.status === 'pending' ? 'Chờ duyệt' : request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><button onClick={() => handleViewDetail(request)} className="text-blue-600 hover:text-blue-900 mr-3">Chi tiết</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} totalItems={filteredRequests.length} showInfo={true} /></div>
        </div>
      </div>

      {showDetailModal && selectedRequestDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-800">Chi tiết đơn đăng ký KTX</h2><Button onClick={() => setShowDetailModal(false)} variant="ghost" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>} /></div>
            <div className="space-y-6">
              <div><h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin sinh viên</h3><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">Họ tên</label><p className="text-gray-900">{selectedRequestDetail.studentName}</p></div><div><label className="block text-sm font-medium text-gray-700">Mã sinh viên</label><p className="text-gray-900">{selectedRequestDetail.studentId}</p></div><div><label className="block text-sm font-medium text-gray-700">Email</label><p className="text-gray-900">{selectedRequestDetail.studentEmail}</p></div><div><label className="block text-sm font-medium text-gray-700">Số điện thoại</label><p className="text-gray-900">{selectedRequestDetail.studentPhone}</p></div><div><label className="block text-sm font-medium text-gray-700">CMND/CCCD</label><p className="text-gray-900">{selectedRequestDetail.studentIdNumber}</p></div><div><label className="block text-sm font-medium text-gray-700">Lớp</label><p className="text-gray-900">{selectedRequestDetail.studentClass}</p></div><div><label className="block text-sm font-medium text-gray-700">Ngành học</label><p className="text-gray-900">{selectedRequestDetail.studentMajor}</p></div><div><label className="block text-sm font-medium text-gray-700">Năm học</label><p className="text-gray-900">{selectedRequestDetail.studentYear}</p></div></div></div>
              <div><h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin phòng</h3><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700">Phòng mong muốn</label><p className="text-gray-900">{selectedRequestDetail.preferredRoom} - {selectedRequestDetail.preferredBuilding}</p></div><div><label className="block text-sm font-medium text-gray-700">Phòng dự phòng</label><p className="text-gray-900">{selectedRequestDetail.alternativeRoom}</p></div><div><label className="block text-sm font-medium text-gray-700">Loại phòng</label><p className="text-gray-900">{selectedRequestDetail.preferredRoomType}</p></div><div><label className="block text-sm font-medium text-gray-700">Khu</label><p className="text-gray-900">{selectedRequestDetail.preferredZone}</p></div></div></div>
              <div><h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin tài chính</h3><div className="grid grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-700">Phí hàng tháng</label><p className="text-gray-900 font-semibold">{formatCurrency(selectedRequestDetail.monthlyFee)}</p></div><div><label className="block text-sm font-medium text-gray-700">Tiền cọc</label><p className="text-gray-900 font-semibold">{formatCurrency(selectedRequestDetail.depositFee)}</p></div><div><label className="block text-sm font-medium text-gray-700">Tổng phí</label><p className="text-gray-900 font-semibold text-lg">{formatCurrency(selectedRequestDetail.totalFee)}</p></div></div></div>
              <div><h3 className="text-lg font-semibold text-gray-800 mb-3">Đánh giá AI</h3><div className="bg-gray-50 p-4 rounded-lg"><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-medium text-gray-700">Độ tin cậy</label><div className="flex items-center space-x-2"><div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedRequestDetail.aiConfidence)}`}>{selectedRequestDetail.aiConfidence}%</div><span className="text-sm text-gray-600">({getConfidenceText(selectedRequestDetail.aiConfidence)})</span></div></div><div><label className="block text-sm font-medium text-gray-700">Thời gian xử lý AI</label><p className="text-gray-900">{formatDate(selectedRequestDetail.aiProcessedAt)}</p></div></div><div className="grid grid-cols-3 gap-4 mb-4"><div><label className="block text-sm font-medium text-gray-700">Độ đầy đủ tài liệu</label><p className="text-gray-900">{selectedRequestDetail.aiAnalysis.documentCompleteness}%</p></div><div><label className="block text-sm font-medium text-gray-700">Độ chính xác thông tin</label><p className="text-gray-900">{selectedRequestDetail.aiAnalysis.informationAccuracy}%</p></div><div><label className="block text-sm font-medium text-gray-700">Điểm đủ điều kiện</label><p className="text-gray-900">{selectedRequestDetail.aiAnalysis.eligibilityScore}%</p></div></div>{selectedRequestDetail.aiAnalysis.riskFactors.length > 0 && (<div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-2">Yếu tố rủi ro</label><ul className="list-disc list-inside text-red-600 space-y-1">{selectedRequestDetail.aiAnalysis.riskFactors.map((risk, index) => (<li key={index}>{risk}</li>))}</ul></div>)}<div><label className="block text-sm font-medium text-gray-700 mb-2">Khuyến nghị AI</label><ul className="list-disc list-inside text-blue-600 space-y-1">{selectedRequestDetail.aiAnalysis.recommendations.map((rec, index) => (<li key={index}>{rec}</li>))}</ul></div></div></div>
              <div><h3 className="text-lg font-semibold text-gray-800 mb-3">Tài liệu đính kèm</h3><div className="space-y-2">{selectedRequestDetail.documents.map((doc, index) => (<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><span className="text-sm text-gray-700">{doc.name}</span><div className="flex items-center space-x-2"><span className={`w-2 h-2 rounded-full ${doc.uploaded ? 'bg-green-500' : 'bg-red-500'}`}></span><span className={`text-xs px-2 py-1 rounded ${doc.uploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{doc.uploaded ? 'Đã tải lên' : 'Chưa tải lên'}</span>{doc.uploaded && (<span className={`text-xs px-2 py-1 rounded ${doc.verified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.verified ? 'Đã xác minh' : 'Chưa xác minh'}</span>)}</div></div>))}</div></div>
            </div>
            <div className="flex justify-end space-x-3 mt-6"><Button onClick={() => setShowDetailModal(false)} variant="outline">Đóng</Button></div>
          </div>
        </div>
      )}

      <RejectionModal isOpen={showRejectionModal} onClose={() => setShowRejectionModal(false)} onConfirm={handleConfirmRejection} title="Nhập lý do từ chối đơn đăng ký" />
    </div>
  );
};

export default RoomRegistrationApprovalPage;
