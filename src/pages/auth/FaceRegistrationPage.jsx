import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const FaceRegistrationPage = ({ onSuccess, onCancel }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Trình duyệt không hỗ trợ camera hoặc đang chạy trên HTTP. Vui lòng sử dụng HTTPS.");
          setIsCameraReady(false);
          return;
        }

        console.log("Đang yêu cầu quyền truy cập camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        console.log("Camera stream:", stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setError('');
          setIsCameraReady(true);
          console.log("Camera đã sẵn sàng!");
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        if (err.name === 'NotAllowedError') {
          setError("Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép camera và thử lại.");
        } else if (err.name === 'NotFoundError') {
          setError("Không tìm thấy camera trên thiết bị này.");
        } else if (err.name === 'NotSupportedError') {
          setError("Trình duyệt không hỗ trợ camera hoặc đang chạy trên HTTP. Vui lòng sử dụng HTTPS.");
        } else {
          setError(`Không thể mở camera: ${err.message}`);
        }
        setIsCameraReady(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const simulateFaceRegistration = () => {
    if (!isCameraReady) {
      setError("Camera chưa sẵn sàng, vui lòng đợi");
      return;
    }

    setIsRegistering(true);
    setError('');
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          
          // Simulate API call for face registration
          setTimeout(() => {
            try {
              // Simulate successful registration
              const mockFaceData = {
                userId: user?.id || 'current_user',
                username: user?.username || 'unknown',
                faceId: `face_${Date.now()}`,
                registeredAt: new Date().toISOString(),
                status: 'active'
              };

              // Store face registration data
              localStorage.setItem('faceRegistration', JSON.stringify(mockFaceData));
              
              setIsRegistering(false);
              setCountdown(0);
              
              // Show success message
              alert('Đăng ký khuôn mặt thành công! Bây giờ bạn có thể sử dụng tính năng đăng nhập bằng khuôn mặt.');
              
              if (onSuccess) {
                onSuccess(mockFaceData);
              }
            } catch (err) {
              setError("Hiện tại không thể đăng ký khuôn mặt, vui lòng thử lại sau.");
              setIsRegistering(false);
              setCountdown(0);
            }
          }, 1000); // Simulate 1 second for processing after countdown
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    // Stop camera
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">📷</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng ký khuôn mặt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đưa khuôn mặt của bạn vào khung hình để đăng ký cho hệ thống
          </p>
          {user && (
            <p className="mt-1 text-center text-sm text-green-600 font-medium">
              Tài khoản: {user.name} ({user.username})
            </p>
          )}
        </div>

        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
          <video 
            ref={videoRef} 
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          ></video>
          
          {/* Camera overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-green-500 rounded-full animate-pulse"></div>
            {isRegistering && countdown > 0 && (
              <span className="absolute text-white text-5xl font-bold bg-black bg-opacity-50 rounded-full w-20 h-20 flex items-center justify-center">
                {countdown}
              </span>
            )}
          </div>

          {/* Camera status indicator */}
          <div className="absolute top-4 right-4">
            <div className={`w-4 h-4 rounded-full ${
              isCameraReady ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
            <div className="mt-2">
              <Button
                variant="outline"
                size="small"
                onClick={() => {
                  setError('');
                  setIsCameraReady(false);
                  // Restart camera
                  const startCamera = async () => {
                    try {
                      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        setError("Trình duyệt không hỗ trợ camera hoặc đang chạy trên HTTP. Vui lòng sử dụng HTTPS.");
                        return;
                      }
                      const stream = await navigator.mediaDevices.getUserMedia({ 
                        video: { 
                          width: { ideal: 640 },
                          height: { ideal: 480 },
                          facingMode: 'user'
                        } 
                      });
                      if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play();
                        setIsCameraReady(true);
                      }
                    } catch (err) {
                      console.error("Error accessing camera: ", err);
                      if (err.name === 'NotAllowedError') {
                        setError("Bạn đã từ chối quyền truy cập camera. Vui lòng cho phép camera và thử lại.");
                      } else if (err.name === 'NotFoundError') {
                        setError("Không tìm thấy camera trên thiết bị này.");
                      } else if (err.name === 'NotSupportedError') {
                        setError("Trình duyệt không hỗ trợ camera hoặc đang chạy trên HTTP. Vui lòng sử dụng HTTPS.");
                      } else {
                        setError(`Không thể mở camera: ${err.message}`);
                      }
                    }
                  };
                  startCamera();
                }}
              >
                Thử lại camera
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Đảm bảo ánh sáng đủ và khuôn mặt rõ ràng</li>
            <li>• Nhìn thẳng vào camera, không đeo kính râm</li>
            <li>• Giữ nguyên vị trí trong quá trình đăng ký</li>
            <li>• Quá trình đăng ký sẽ mất khoảng 4 giây</li>
          </ul>
        </div>

        <div className="flex justify-between space-x-4">
          <Button
            variant="success"
            onClick={simulateFaceRegistration}
            disabled={isRegistering || !isCameraReady || error}
            loading={isRegistering}
            loadingText={countdown > 0 ? `Đang đăng ký... (${countdown})` : 'Đang xử lý...'}
            fullWidth
          >
            Bắt đầu đăng ký
          </Button>
          
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isRegistering}
            fullWidth
          >
            Hủy
          </Button>
        </div>

        {/* Registration Status */}
        <div className="text-center">
          <div className="text-sm text-gray-500">
            Trạng thái camera: 
            <span className={`ml-1 font-medium ${
              isCameraReady ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCameraReady ? 'Sẵn sàng' : 'Chưa sẵn sàng'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistrationPage;
