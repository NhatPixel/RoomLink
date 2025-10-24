import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const HealthCheckupCreation = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationStartDate: '',
    registrationEndDate: '',
    location: '',
    maxParticipants: '',
    fee: '',
    requirements: '',
    notes: '',
    status: 'active'
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Mock locations
  const locations = [
    'Phòng khám KTX - Tòa A',
    'Phòng khám KTX - Tòa B', 
    'Phòng khám KTX - Tòa C',
    'Bệnh viện Đại học Bách Khoa',
    'Trung tâm Y tế Quận Hai Bà Trưng',
    'Phòng khám đa khoa KTX'
  ];

  // Mock requirements
  const requirementOptions = [
    'CMND/CCCD',
    'Thẻ sinh viên',
    'Giấy khai sinh',
    'Sổ khám bệnh (nếu có)',
    'Kết quả khám sức khỏe cũ (nếu có)',
    'Ảnh 3x4',
    'Giấy xác nhận tình trạng sức khỏe'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle requirements as array
      if (name === 'requirements') {
        const currentRequirements = formData.requirements.split(',').filter(req => req.trim());
        if (checked) {
          currentRequirements.push(value);
        } else {
          const index = currentRequirements.indexOf(value);
          if (index > -1) {
            currentRequirements.splice(index, 1);
          }
        }
        setFormData(prev => ({
          ...prev,
          [name]: currentRequirements.join(', ')
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Vui lòng nhập tên đợt khám sức khỏe';
    }

    if (!formData.description.trim()) {
      errors.description = 'Vui lòng nhập mô tả đợt khám';
    }

    if (!formData.startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu khám';
    }

    if (!formData.endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc khám';
    }

    if (!formData.registrationStartDate) {
      errors.registrationStartDate = 'Vui lòng chọn ngày bắt đầu đăng ký';
    }

    if (!formData.registrationEndDate) {
      errors.registrationEndDate = 'Vui lòng chọn ngày kết thúc đăng ký';
    }

    if (!formData.location) {
      errors.location = 'Vui lòng chọn địa điểm khám';
    }

    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      errors.maxParticipants = 'Vui lòng nhập số lượng tối đa hợp lệ';
    }

    if (!formData.fee || formData.fee < 0) {
      errors.fee = 'Vui lòng nhập phí khám hợp lệ';
    }

    // Date validation
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (formData.registrationStartDate && formData.registrationEndDate) {
      if (new Date(formData.registrationStartDate) >= new Date(formData.registrationEndDate)) {
        errors.registrationEndDate = 'Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký';
      }
    }

    if (formData.registrationEndDate && formData.startDate) {
      if (new Date(formData.registrationEndDate) >= new Date(formData.startDate)) {
        errors.registrationEndDate = 'Ngày kết thúc đăng ký phải trước ngày bắt đầu khám';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Thông tin đợt khám không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create health checkup session
      const healthCheckupSession = {
        id: `HEALTH${Date.now()}`,
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        registrationStartDate: formData.registrationStartDate,
        registrationEndDate: formData.registrationEndDate,
        location: formData.location,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 0,
        fee: parseInt(formData.fee),
        requirements: formData.requirements,
        notes: formData.notes,
        status: formData.status,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'Admin001',
        createdByName: user?.name || 'Quản trị viên'
      };

      // Save to localStorage
      const existingSessions = JSON.parse(localStorage.getItem('healthCheckupSessions') || '[]');
      existingSessions.push(healthCheckupSession);
      localStorage.setItem('healthCheckupSessions', JSON.stringify(existingSessions));

      setSuccess('Tạo đợt khám sức khỏe thành công!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        registrationStartDate: '',
        registrationEndDate: '',
        location: '',
        maxParticipants: '',
        fee: '',
        requirements: '',
        notes: '',
        status: 'active'
      });

      // Redirect after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(healthCheckupSession);
        }
      }, 2000);

    } catch (error) {
      console.error('Error creating health checkup session:', error);
      setError('Có lỗi xảy ra khi tạo đợt khám sức khỏe');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Tạo đợt khám sức khỏe</h1>
              <p className="text-gray-600 mt-1">Tạo mới một đợt khám sức khỏe cho sinh viên</p>
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

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-800 font-medium">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cơ bản</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đợt khám sức khỏe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="VD: Khám sức khỏe định kỳ học kỳ 1 năm 2024"
                  />
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Mô tả chi tiết về đợt khám sức khỏe..."
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm khám <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn địa điểm khám</option>
                    {locations.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                  {validationErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              {/* Schedule Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin lịch trình</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc khám <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registrationStartDate"
                    value={formData.registrationStartDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.registrationStartDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.registrationStartDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.registrationStartDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc đăng ký <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registrationEndDate"
                    value={formData.registrationEndDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.registrationEndDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.registrationEndDate && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.registrationEndDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity and Fee Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="VD: 100"
                />
                {validationErrors.maxParticipants && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.maxParticipants}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí khám sức khỏe <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 pr-16 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.fee ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 text-sm">VND</span>
                  </div>
                </div>
                {validationErrors.fee && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fee}</p>
                )}
                {formData.fee && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatCurrency(formData.fee)}
                  </p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Yêu cầu tài liệu
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {requirementOptions.map((requirement) => (
                  <label key={requirement} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="requirements"
                      value={requirement}
                      checked={formData.requirements.includes(requirement)}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{requirement}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Các ghi chú khác về đợt khám sức khỏe..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                loadingText="Đang tạo..."
                variant="primary"
              >
                Tạo đợt khám sức khỏe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckupCreation;
