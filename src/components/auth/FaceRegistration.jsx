import React, { useState, useRef, useEffect } from 'react';

const FaceRegistration = ({ onSuccess, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Chuẩn bị đăng ký khuôn mặt...');
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      setStatus('Đang khởi động camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('Camera đã sẵn sàng. Hãy đưa khuôn mặt vào khung hình.');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Hiện tại không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.');
      setStatus('Lỗi camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    return {
      imageDataUrl,
      width: canvas.width,
      height: canvas.height,
      timestamp: Date.now()
    };
  };

  const handleCapture = () => {
    setIsCapturing(true);
    setError('');
    setStatus('Đang chụp ảnh khuôn mặt...');

    try {
      const capturedData = captureFace();
      
      if (capturedData) {
        setCapturedImage(capturedData.imageDataUrl);
        setStatus('Ảnh đã được chụp thành công!');
      } else {
        throw new Error('Không thể chụp ảnh khuôn mặt');
      }
    } catch (err) {
      setError('Lỗi khi chụp ảnh: ' + err.message);
      setStatus('Lỗi chụp ảnh');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRegister = () => {
    if (!capturedImage) {
      setError('Vui lòng chụp ảnh khuôn mặt trước khi đăng ký');
      return;
    }

    setStatus('Đang đăng ký khuôn mặt...');
    
    // Simulate registration process
    setTimeout(() => {
      setStatus('Đăng ký khuôn mặt thành công!');
      
      // Store face data in localStorage (in real app, this would go to backend)
      const faceData = {
        id: Date.now(),
        imageDataUrl: capturedImage,
        registeredAt: new Date().toISOString(),
        userId: 'current_user' // In real app, this would be the logged-in user ID
      };

      // Get existing face registrations or create new array
      const existingFaces = JSON.parse(localStorage.getItem('registeredFaces') || '[]');
      existingFaces.push(faceData);
      localStorage.setItem('registeredFaces', JSON.stringify(existingFaces));

      setTimeout(() => {
        onSuccess(faceData);
      }, 1500);
    }, 2000);
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStatus('Chuẩn bị chụp lại...');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">📷</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng ký khuôn mặt
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Chụp ảnh khuôn mặt để sử dụng tính năng đăng nhập bằng khuôn mặt
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Camera Preview */}
          <div className="mb-6">
            <div className="relative bg-gray-200 rounded-lg overflow-hidden">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured face"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
              )}
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Overlay khi đang chụp */}
              {isCapturing && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="text-green-600 font-medium">Đang chụp...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <p className="text-center text-sm text-gray-600">{status}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                disabled={isCapturing || error.includes('camera')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCapturing ? 'Đang chụp...' : 'Chụp ảnh khuôn mặt'}
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleRegister}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Đăng ký khuôn mặt
                </button>
                
                <button
                  onClick={handleRetake}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Chụp lại
                </button>
              </div>
            )}

            <button
              onClick={handleCancel}
              disabled={isCapturing}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-xs text-green-600 space-y-1">
              <li>• Đảm bảo ánh sáng đủ để camera nhìn rõ khuôn mặt</li>
              <li>• Giữ khuôn mặt ở giữa khung hình</li>
              <li>• Không đeo khẩu trang hoặc che khuất mặt</li>
              <li>• Nhìn thẳng vào camera và giữ nguyên tư thế</li>
              <li>• Chỉ chụp khuôn mặt của bạn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRegistration;
