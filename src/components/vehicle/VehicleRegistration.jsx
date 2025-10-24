import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import FileUploadButton from '../ui/FileUploadButton';

const VehicleRegistration = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: 'motorcycle', // motorcycle, car, bicycle
    brand: '',
    model: '',
    color: '',
    description: ''
  });
  const [licensePlateImage, setLicensePlateImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Vietnamese license plate validation patterns
  const licensePlatePatterns = {
    motorcycle: [
      /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/, // Standard motorcycle: 30A-12345
      /^[0-9]{2}[A-Z]{1}[0-9]{4}$/, // Old format: 30A-1234
    ],
    car: [
      /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/, // Standard car: 30A-12345
      /^[0-9]{2}[A-Z]{1}[0-9]{4}$/, // Old format: 30A-1234
    ],
    bicycle: [
      /^[A-Z]{2}[0-9]{6}$/, // Bicycle: AB-123456
    ]
  };

  const vehicleTypes = [
    { value: 'motorcycle', label: 'Xe máy', icon: '🏍️' },
    { value: 'car', label: 'Ô tô', icon: '🚗' },
    { value: 'bicycle', label: 'Xe đạp', icon: '🚲' }
  ];

  const colors = [
    'Đen', 'Trắng', 'Xám', 'Bạc', 'Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Cam', 'Tím', 'Hồng', 'Nâu', 'Khác'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageUpload = (file, event) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh hợp lệ');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }

      setLicensePlateImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    setError('');
  };

  const removeImage = () => {
    setLicensePlateImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateLicensePlate = (plate, vehicleType) => {
    const patterns = licensePlatePatterns[vehicleType];
    if (!patterns) return false;

    // Remove spaces and convert to uppercase
    const cleanPlate = plate.replace(/\s/g, '').toUpperCase();
    
    return patterns.some(pattern => pattern.test(cleanPlate));
  };

  const formatLicensePlate = (plate) => {
    // Remove spaces and convert to uppercase
    const cleanPlate = plate.replace(/\s/g, '').toUpperCase();
    
    // Add dash for better readability
    if (cleanPlate.length >= 7) {
      return cleanPlate.slice(0, 2) + '-' + cleanPlate.slice(2);
    }
    return cleanPlate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.licensePlate.trim()) {
        throw new Error('Vui lòng nhập biển số xe');
      }

      if (!validateLicensePlate(formData.licensePlate, formData.vehicleType)) {
        throw new Error('Thông tin biển số không chính xác, vui lòng kiểm tra lại');
      }

      if (!licensePlateImage) {
        throw new Error('Vui lòng tải lên hình ảnh biển số xe');
      }

      if (!formData.brand.trim()) {
        throw new Error('Vui lòng nhập hãng xe');
      }

      if (!formData.model.trim()) {
        throw new Error('Vui lòng nhập model xe');
      }

      if (!formData.color) {
        throw new Error('Vui lòng chọn màu xe');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create vehicle registration request with full details for admin approval
      const vehicleRegistrationRequest = {
        id: `VEHICLE${Date.now()}`,
        studentId: user.id,
        studentName: user.name,
        studentEmail: user.email,
        studentPhone: user.phone || '0123456789',
        studentIdNumber: user.studentId || '20190001',
        vehicle: {
          licensePlate: formatLicensePlate(formData.licensePlate),
          vehicleType: formData.vehicleType === 'motorcycle' ? 'Xe máy' : 
                       formData.vehicleType === 'electric_bike' ? 'Xe đạp điện' : 
                       formData.vehicleType === 'bicycle' ? 'Xe đạp' : 'Xe máy',
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          engineNumber: 'ABC123456', // Mock data
          chassisNumber: 'XYZ789012', // Mock data
          yearOfManufacture: new Date().getFullYear() - Math.floor(Math.random() * 5), // Random year
          description: formData.description,
          imageUrl: '/api/placeholder/300/200'
        },
        registration: {
          requestDate: new Date().toISOString().split('T')[0],
          purpose: 'Đi lại hàng ngày',
          expectedStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          duration: '12 tháng',
          notes: 'Đăng ký xe mới'
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        documents: {
          vehicleRegistration: true,
          insurance: formData.vehicleType === 'motorcycle',
          driverLicense: formData.vehicleType === 'motorcycle',
          studentId: true,
          roomContract: true
        }
      };

      // Save to localStorage (simulate database)
      const existingRegistrations = JSON.parse(localStorage.getItem('vehicleRegistrationRequests') || '[]');
      
      // Check for duplicate license plate
      const duplicatePlate = existingRegistrations.find(
        reg => reg.vehicle.licensePlate === vehicleRegistrationRequest.vehicle.licensePlate
      );
      
      if (duplicatePlate) {
        throw new Error('Biển số xe này đã được đăng ký trong hệ thống');
      }

      existingRegistrations.push(vehicleRegistrationRequest);
      localStorage.setItem('vehicleRegistrationRequests', JSON.stringify(existingRegistrations));

      // Also save to old format for backward compatibility
      const vehicleData = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        licensePlate: formatLicensePlate(formData.licensePlate),
        vehicleType: formData.vehicleType,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        description: formData.description,
        registrationDate: new Date().toISOString(),
        status: 'pending',
        imageFile: licensePlateImage.name,
        imageSize: licensePlateImage.size
      };

      const oldRegistrations = JSON.parse(localStorage.getItem('vehicleRegistrations') || '[]');
      oldRegistrations.push(vehicleData);
      localStorage.setItem('vehicleRegistrations', JSON.stringify(oldRegistrations));

      setSuccess('Đăng ký thành công!');
      
      // Reset form
      setFormData({
        licensePlate: '',
        vehicleType: 'motorcycle',
        brand: '',
        model: '',
        color: '',
        description: ''
      });
      setLicensePlateImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(vehicleData);
        }
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeLabel = (type) => {
    const vehicleType = vehicleTypes.find(vt => vt.value === type);
    return vehicleType ? vehicleType.label : type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Đăng ký biển số xe</h1>
              <p className="text-gray-600 mt-1">Đăng ký thông tin xe để ra vào KTX hợp lệ</p>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Loại phương tiện <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicleTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.vehicleType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="vehicleType"
                      value={type.value}
                      checked={formData.vehicleType === type.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* License Plate */}
            <div>
              <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
                Biển số xe <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                placeholder="VD: 30A-12345, AB-123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Định dạng: {formData.vehicleType === 'bicycle' ? 'AB-123456' : '30A-12345'}
              </p>
            </div>

            {/* Vehicle Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Hãng xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="VD: Honda, Yamaha, Toyota"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="VD: Wave RSX, Vios"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Màu xe <span className="text-red-500">*</span>
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Chọn màu xe</option>
                {colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* License Plate Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh biển số xe <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                <FileUploadButton
                  accept="image/*"
                  onChange={handleImageUpload}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  Chọn hình ảnh biển số xe
                </FileUploadButton>
                
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="License plate preview"
                      className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Tải lên hình ảnh rõ nét của biển số xe (tối đa 5MB)
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Thông tin bổ sung về xe (không bắt buộc)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Information Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Lưu ý quan trọng:</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                <li>Biển số xe phải đúng định dạng theo quy định của Việt Nam</li>
                <li>Hình ảnh biển số phải rõ nét, không bị mờ hoặc che khuất</li>
                <li>Thông tin đăng ký sẽ được xem xét và phê duyệt trong vòng 24-48 giờ</li>
                <li>Sau khi được phê duyệt, bạn có thể sử dụng xe để ra vào KTX</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                loadingText="Đang xử lý..."
              >
                Đăng ký biển số xe
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleRegistration;
