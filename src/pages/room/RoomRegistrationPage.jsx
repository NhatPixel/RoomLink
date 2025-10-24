import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import RoomSelection from '../../components/room/RoomSelection';

const RoomRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState('room-selection'); // room-selection, personal-info
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleRoomSelected = (room) => {
    setSelectedRoom(room);
    setCurrentStep('personal-info');
  };

  const handleCancel = () => {
    window.location.href = '/student';
  };

  const handleBackToRoomSelection = () => {
    setCurrentStep('room-selection');
    setSelectedRoom(null);
  };

  const handlePersonalInfoSubmit = (personalData) => {
    // Combine room and personal data
    const registrationData = {
      ...personalData,
      room: selectedRoom,
      registrationDate: new Date().toISOString(),
      status: 'pending'
    };

    // Store registration data
    localStorage.setItem('roomRegistration', JSON.stringify(registrationData));
    
    alert('Đăng ký phòng thành công! Hồ sơ của bạn đang được xét duyệt.');
    window.location.href = '/student';
  };

  if (currentStep === 'room-selection') {
    return (
      <RoomSelection 
        onRoomSelected={handleRoomSelected}
        onCancel={handleCancel}
      />
    );
  }

  if (currentStep === 'personal-info') {
    return (
      <PersonalInfoForm 
        selectedRoom={selectedRoom}
        onSubmit={handlePersonalInfoSubmit}
        onBack={handleBackToRoomSelection}
        onCancel={handleCancel}
      />
    );
  }

  return null;
};

// Personal Information Form Component
const PersonalInfoForm = ({ selectedRoom, onSubmit, onBack, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    university: '',
    faculty: '',
    yearOfStudy: '',
    expectedStayDuration: '',
    specialRequirements: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Mã số sinh viên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh không được để trống';
    }

    if (!formData.gender) {
      newErrors.gender = 'Giới tính không được để trống';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ không được để trống';
    }

    if (!formData.university.trim()) {
      newErrors.university = 'Trường đại học không được để trống';
    }

    if (!formData.faculty.trim()) {
      newErrors.faculty = 'Khoa không được để trống';
    }

    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = 'Năm học không được để trống';
    }

    if (!formData.expectedStayDuration) {
      newErrors.expectedStayDuration = 'Thời gian ở dự kiến không được để trống';
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
        setIsLoading(false);
        onSubmit(formData);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="mt-2 text-gray-600">Hoàn thiện thông tin để hoàn tất đăng ký phòng</p>
        </div>

        {/* Selected Room Info */}
        {selectedRoom && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Phòng đã chọn</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Phòng:</span>
                <span className="ml-2 text-blue-600">{selectedRoom.roomNumber}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Loại:</span>
                <span className="ml-2 text-blue-600">{selectedRoom.roomType}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Giá:</span>
                <span className="ml-2 text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(selectedRoom.price)}/tháng
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập họ và tên"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã số sinh viên *
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.studentId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập mã số sinh viên"
                  />
                  {errors.studentId && (
                    <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    }`}
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
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ thường trú *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nhập địa chỉ thường trú"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ khẩn cấp</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên người liên hệ
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ tên người liên hệ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại liên hệ"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin học tập</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trường đại học *
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.university ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên trường đại học"
                  />
                  {errors.university && (
                    <p className="mt-1 text-sm text-red-600">{errors.university}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khoa *
                  </label>
                  <input
                    type="text"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.faculty ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên khoa"
                  />
                  {errors.faculty && (
                    <p className="mt-1 text-sm text-red-600">{errors.faculty}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Năm học *
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.yearOfStudy ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn năm học</option>
                    <option value="1">Năm 1</option>
                    <option value="2">Năm 2</option>
                    <option value="3">Năm 3</option>
                    <option value="4">Năm 4</option>
                    <option value="5">Năm 5</option>
                    <option value="graduate">Sau đại học</option>
                  </select>
                  {errors.yearOfStudy && (
                    <p className="mt-1 text-sm text-red-600">{errors.yearOfStudy}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian ở dự kiến *
                  </label>
                  <select
                    name="expectedStayDuration"
                    value={formData.expectedStayDuration}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expectedStayDuration ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn thời gian ở</option>
                    <option value="1-semester">1 học kỳ</option>
                    <option value="1-year">1 năm</option>
                    <option value="2-years">2 năm</option>
                    <option value="3-years">3 năm</option>
                    <option value="4-years">4 năm</option>
                    <option value="until-graduation">Đến khi tốt nghiệp</option>
                  </select>
                  {errors.expectedStayDuration && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedStayDuration}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu đặc biệt</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu đặc biệt (nếu có)
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập các yêu cầu đặc biệt (ví dụ: phòng tầng thấp, gần thang máy, v.v.)"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                >
                  Quay lại chọn phòng
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                >
                  Hủy
                </Button>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                loadingText="Đang xử lý..."
              >
                Hoàn tất đăng ký phòng
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoomRegistrationPage;
