import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import defaultAvatar0 from '../../assets/default_avatar_0.png';
import defaultAvatar1 from '../../assets/default_avatar_1.png';
import defaultAvatar2 from '../../assets/default_avatar_2.png';
import defaultAvatar3 from '../../assets/default_avatar_3.png';
import defaultAvatar4 from '../../assets/default_avatar_4.png';
import defaultAvatar5 from '../../assets/default_avatar_5.png';

const EditProfile = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    university: '',
    hometown: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Dữ liệu mẫu thông tin sinh viên
  const mockStudentData = {
    studentId: '22110390',
    fullName: 'Nguyễn Văn A',
    gender: 'male',
    dateOfBirth: '2003-05-15',
    university: 'Đại học Sư phạm Kỹ thuật TP.HCM',
    hometown: 'Hà Nội',
    phone: '0123456789',
    email: 'student001@roomlink.com',
    avatar: defaultAvatar0,
    roomNumber: 'A101',
    registrationDate: '2024-01-15',
    status: 'active'
  };

  useEffect(() => {
    // Load existing student data
    const savedData = localStorage.getItem('studentProfile');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({
          studentId: parsedData.studentId || mockStudentData.studentId,
          fullName: parsedData.fullName || mockStudentData.fullName,
          gender: parsedData.gender || mockStudentData.gender,
          dateOfBirth: parsedData.dateOfBirth || mockStudentData.dateOfBirth,
          university: parsedData.university || mockStudentData.university,
          hometown: parsedData.hometown || mockStudentData.hometown,
          phone: parsedData.phone || mockStudentData.phone,
          email: parsedData.email || mockStudentData.email
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
        setFormData({
          studentId: mockStudentData.studentId,
          fullName: mockStudentData.fullName,
          gender: mockStudentData.gender,
          dateOfBirth: mockStudentData.dateOfBirth,
          university: mockStudentData.university,
          hometown: mockStudentData.hometown,
          phone: mockStudentData.phone,
          email: mockStudentData.email
        });
      }
    } else {
      setFormData({
        studentId: mockStudentData.studentId,
        fullName: mockStudentData.fullName,
        gender: mockStudentData.gender,
        dateOfBirth: mockStudentData.dateOfBirth,
        university: mockStudentData.university,
        hometown: mockStudentData.hometown,
        phone: mockStudentData.phone,
        email: mockStudentData.email
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Student ID
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Mã số sinh viên không được để trống';
    } else if (!/^\d{8}$/.test(formData.studentId)) {
      newErrors.studentId = 'Mã số sinh viên phải có 8 chữ số';
    }

    // Validate Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate Gender
    if (!formData.gender) {
      newErrors.gender = 'Giới tính không được để trống';
    }

    // Validate Date of Birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh không được để trống';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 30) {
        newErrors.dateOfBirth = 'Tuổi phải từ 16 đến 30';
      }
    }

    // Validate University
    if (!formData.university.trim()) {
      newErrors.university = 'Trường đại học không được để trống';
    }

    // Validate Hometown
    if (!formData.hometown.trim()) {
      newErrors.hometown = 'Quê quán không được để trống';
    }

    // Validate Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        try {
          // Save updated profile data
          const updatedProfile = {
            ...formData,
            avatar: defaultAvatar0,
            lastUpdated: new Date().toISOString()
          };
          
          localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));
          
          setIsLoading(false);
          setIsEditing(false);
          onSuccess(updatedProfile);
        } catch (error) {
          console.error('Error saving profile:', error);
          setErrors({ general: 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.' });
          setIsLoading(false);
        }
      }, 1500);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    
    // Reload original data
    const savedData = localStorage.getItem('studentProfile');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData({
        studentId: parsedData.studentId,
        fullName: parsedData.fullName,
        gender: parsedData.gender,
        dateOfBirth: parsedData.dateOfBirth,
        university: parsedData.university,
        hometown: parsedData.hometown,
        phone: parsedData.phone,
        email: parsedData.email
      });
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarChange = (newAvatar) => {
    // Update avatar in localStorage
    const savedData = localStorage.getItem('studentProfile');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      parsedData.avatar = newAvatar;
      localStorage.setItem('studentProfile', JSON.stringify(parsedData));
    }
    setShowAvatarModal(false);
  };

  const formatPhoneNumber = (phone) => {
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="mt-2 text-gray-600">Xem và chỉnh sửa thông tin cá nhân của bạn</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                <img
                  src={defaultAvatar0}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg group-hover:shadow-xl transition-shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center md:text-left text-white">
                <h2 className="text-2xl font-bold">{formData.fullName}</h2>
                <p className="text-blue-100">Mã số sinh viên: {formData.studentId}</p>
                <p className="text-blue-100">Phòng: {mockStudentData.roomNumber}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã số sinh viên *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.studentId ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập mã số sinh viên"
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                  )}
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>

                {/* University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trường đại học *
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.university ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập tên trường đại học"
                  />
                  {errors.university && (
                    <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                  )}
                </div>

                {/* Hometown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quê quán *
                  </label>
                  <input
                    type="text"
                    name="hometown"
                    value={formData.hometown}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.hometown ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập quê quán"
                  />
                  {errors.hometown && (
                    <p className="mt-1 text-sm text-red-600">{errors.hometown}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                  >
                    Quay lại
                  </Button>
                </div>

                <div className="flex space-x-4">
                  {!isEditing ? (
                    <Button
                      variant="primary"
                      onClick={handleEdit}
                    >
                      Chỉnh sửa thông tin
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Hủy
                      </Button>
                      <Button
                        variant="success"
                        onClick={handleSubmit}
                        loading={isLoading}
                        loadingText="Đang lưu..."
                      >
                        Lưu thay đổi
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Thông tin bổ sung</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Ngày đăng ký:</span>
              <span className="ml-2 text-blue-600">
                {new Date(mockStudentData.registrationDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Trạng thái:</span>
              <span className="ml-2 text-blue-600 capitalize">{mockStudentData.status}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Phòng hiện tại:</span>
              <span className="ml-2 text-blue-600">{mockStudentData.roomNumber}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Cập nhật lần cuối:</span>
              <span className="ml-2 text-blue-600">
                {new Date().toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <AvatarChangeModal 
          onClose={() => setShowAvatarModal(false)}
          onAvatarChange={handleAvatarChange}
        />
      )}
    </div>
  );
};

// Avatar Change Modal Component
const AvatarChangeModal = ({ onClose, onAvatarChange }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar0);
  const [isUploading, setIsUploading] = useState(false);

  // Predefined avatar options
  const avatarOptions = [
    { id: 'avatar0', src: defaultAvatar0, name: 'Avatar 0' },
    { id: 'avatar1', src: defaultAvatar1, name: 'Avatar 1' },
    { id: 'avatar2', src: defaultAvatar2, name: 'Avatar 2' },
    { id: 'avatar3', src: defaultAvatar3, name: 'Avatar 3' },
    { id: 'avatar4', src: defaultAvatar4, name: 'Avatar 4' },
    { id: 'avatar5', src: defaultAvatar5, name: 'Avatar 5' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      
      // Simulate file upload
      setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setSelectedAvatar(event.target.result);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }, 1000);
    }
  };

  const handleConfirm = () => {
    onAvatarChange(selectedAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Thay đổi ảnh đại diện</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Avatar Preview */}
          <div className="text-center mb-6">
            <div className="inline-block">
              <img
                src={selectedAvatar}
                alt="Selected Avatar"
                className="w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg"
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">Ảnh đại diện hiện tại</p>
          </div>

          {/* Upload New Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải lên ảnh mới
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {isUploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Hỗ trợ định dạng: JPG, PNG, GIF. Kích thước tối đa: 5MB
            </p>
          </div>

          {/* Avatar Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Hoặc chọn từ thư viện có sẵn
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {avatarOptions.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`cursor-pointer rounded-lg p-2 transition-all ${
                    selectedAvatar === avatar.src
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAvatar(avatar.src)}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="w-full h-16 object-cover rounded-md"
                  />
                  <p className="text-xs text-center mt-1 text-gray-600">{avatar.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
