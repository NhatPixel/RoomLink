import React, { useState, useEffect } from 'react';
import PlateRecognition from '../../components/vehicle/PlateRecognition';
import { useNotification } from '../../contexts/NotificationContext';
import Button from '../../components/ui/Button';
import defaultNumberPlate from '../../assets/default_number_plate.jpg';

const PlateDetectionPage = ({ onCancel }) => {
  const { showSuccess, showError } = useNotification();
  const [detectionResult, setDetectionResult] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [detectedImageUrl, setDetectedImageUrl] = useState(null);

  const handleDetectionSuccess = (result) => {
    console.log('Plate detection successful:', result);
    setDetectionResult(result);
    
    // Luôn xóa URL cũ trước khi tạo mới
    if (detectedImageUrl) {
      URL.revokeObjectURL(detectedImageUrl);
    }
    
    // Tạo URL từ blob ảnh được dùng để call API
    if (result.image && result.image instanceof Blob) {
      const imageUrl = URL.createObjectURL(result.image);
      setDetectedImageUrl(imageUrl);
      console.log('Set new success image URL:', imageUrl);
    } else {
      setDetectedImageUrl(null);
    }
    
    // Lấy thông tin sinh viên từ response
    const numberPlateData = result.numberPlate;
    
    if (numberPlateData) {
      // Extract thông tin sinh viên từ response
      // Response từ backend có cấu trúc: numberPlate.Student.User
      const student = numberPlateData.Student;
      const user = student?.User;
      
      const studentData = {
        name: user?.name || numberPlateData.name,
        mssv: student?.mssv || numberPlateData.mssv,
        school: student?.school || numberPlateData.school,
        identification: user?.identification || numberPlateData.identification,
        gender: user?.gender || numberPlateData.gender,
        number: numberPlateData.number,
        registerDate: numberPlateData.registerDate
      };
      
      // Cập nhật thông tin mới (tự động xóa thông tin cũ)
      setStudentInfo(studentData);
    } else {
      // Nếu không có dữ liệu, xóa thông tin cũ
      setStudentInfo(null);
    }
  };

  const handleDetectionError = (error, result) => {
    console.log('Detection error:', error, result);
    
    // Xóa thông tin sinh viên cũ khi nhận diện thất bại
    setStudentInfo(null);
    
    // Luôn xóa URL cũ trước
    if (detectedImageUrl) {
      URL.revokeObjectURL(detectedImageUrl);
      setDetectedImageUrl(null);
    }
    
    // Vẫn lưu ảnh blob nếu có để hiển thị
    if (result && result.image && result.image instanceof Blob) {
      const imageUrl = URL.createObjectURL(result.image);
      setDetectedImageUrl(imageUrl);
      console.log('Set new error image URL:', imageUrl);
    }
  };

  const handleCancelInternal = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = '/admin';
    }
  };

  // Cleanup URL khi component unmount
  useEffect(() => {
    return () => {
      if (detectedImageUrl) {
        URL.revokeObjectURL(detectedImageUrl);
      }
    };
  }, [detectedImageUrl]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="relative">
      <PlateRecognition
        onSuccess={handleDetectionSuccess}
        onCancel={handleCancelInternal}
        onError={handleDetectionError}
      />

      {/* Info Panel - Right Side (Fixed Position) */}
      {(studentInfo || detectedImageUrl) && (
        <div className="fixed top-20 right-4 w-80 bg-white border border-gray-200 rounded-lg p-6 shadow-lg max-h-[calc(100vh-6rem)] overflow-y-auto z-50">
          {studentInfo ? (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin sinh viên</h3>
              
              <div className="space-y-4">
                {/* Thông tin sinh viên */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin cá nhân</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Họ tên</label>
                      <p className="text-sm text-gray-900 mt-1">{studentInfo?.name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Giới tính</label>
                      <p className="text-sm text-gray-900 mt-1">{studentInfo?.gender === 'male' ? 'Nam' : studentInfo?.gender === 'female' ? 'Nữ' : '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">CCCD</label>
                      <p className="text-sm text-gray-900 mt-1">{studentInfo?.identification || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Thông tin biển số */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Thông tin biển số</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Số biển số</label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{studentInfo?.number || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Ngày đăng ký</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(studentInfo?.registerDate)}</p>
                    </div>
                    {detectedImageUrl && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">Ảnh biển số</label>
                        <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                          <img
                            key={detectedImageUrl}
                            src={detectedImageUrl}
                            alt="Ảnh biển số nhận diện"
                            className="w-full h-32 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              window.open(detectedImageUrl, '_blank');
                            }}
                            onError={(e) => {
                              console.error('Error loading image:', detectedImageUrl);
                              e.target.src = defaultNumberPlate;
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Nhận diện thất bại</h3>
              {detectedImageUrl && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Ảnh đã gửi</label>
                  <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                    <img
                      key={detectedImageUrl}
                      src={detectedImageUrl}
                      alt="Ảnh biển số nhận diện"
                      className="w-full h-32 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        window.open(detectedImageUrl, '_blank');
                      }}
                      onError={(e) => {
                        console.error('Error loading image:', detectedImageUrl);
                        e.target.src = defaultNumberPlate;
                      }}
                    />
                  </div>
                  <p className="text-xs text-red-600 mt-2">Không thể nhận diện biển số từ ảnh này.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PlateDetectionPage;

