import React, { useState, useRef, useEffect } from 'react';

const FaceRecognition = ({ onSuccess, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Chuẩn bị quét khuôn mặt...');

  // Dữ liệu mẫu khuôn mặt đã đăng ký
  const registeredFaces = [
    {
      id: 1,
      userId: 1,
      username: 'admin',
      name: 'Quản trị viên',
      role: 'admin',
      faceData: 'admin_face_data', // Mô phỏng dữ liệu khuôn mặt
      email: 'admin@roomlink.com'
    },
    {
      id: 2,
      userId: 2,
      username: 'student001',
      name: 'Nguyễn Văn A',
      role: 'student',
      faceData: 'student001_face_data',
      email: 'student001@roomlink.com',
      studentId: '22110390'
    },
    {
      id: 3,
      userId: 3,
      username: 'student002',
      name: 'Trần Thị B',
      role: 'student',
      faceData: 'student002_face_data',
      email: 'student002@roomlink.com',
      studentId: '22110335'
    }
  ];

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

    // Get image data (mô phỏng việc trích xuất đặc trưng khuôn mặt)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Mô phỏng dữ liệu khuôn mặt (trong thực tế sẽ là vector đặc trưng)
    return {
      width: canvas.width,
      height: canvas.height,
      timestamp: Date.now(),
      hash: Math.random().toString(36).substring(7) // Mô phỏng hash của khuôn mặt
    };
  };

  const simulateFaceRecognition = (capturedFace) => {
    // Mô phỏng thuật toán AI nhận diện khuôn mặt
    return new Promise((resolve) => {
      setTimeout(() => {
        // Giả lập độ chính xác cao (90% thành công)
        const isMatch = Math.random() > 0.1;
        
        if (isMatch) {
          // Chọn ngẫu nhiên một khuôn mặt đã đăng ký
          const matchedFace = registeredFaces[Math.floor(Math.random() * registeredFaces.length)];
          resolve({
            success: true,
            user: {
              id: matchedFace.userId,
              username: matchedFace.username,
              name: matchedFace.name,
              role: matchedFace.role,
              email: matchedFace.email,
              studentId: matchedFace.studentId
            }
          });
        } else {
          resolve({
            success: false,
            message: 'Không nhận diện được khuôn mặt. Vui lòng thử lại.'
          });
        }
      }, 2000); // Mô phỏng thời gian xử lý AI
    });
  };

  const startFaceScan = async () => {
    setIsScanning(true);
    setError('');
    setStatus('Đang quét khuôn mặt...');

    try {
      // Chụp ảnh khuôn mặt
      const capturedFace = captureFace();
      
      if (!capturedFace) {
        throw new Error('Không thể chụp ảnh khuôn mặt');
      }

      setStatus('Đang phân tích khuôn mặt...');

      // Mô phỏng AI nhận diện
      const result = await simulateFaceRecognition(capturedFace);

      if (result.success) {
        setStatus('Xác thực thành công!');
        
        // Lưu thông tin đăng nhập
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Gọi callback thành công
        setTimeout(() => {
          onSuccess(result.user);
        }, 1000);
      } else {
        setError(result.message);
        setStatus('Xác thực thất bại');
        setIsScanning(false);
      }
    } catch (err) {
      setError('Lỗi trong quá trình xác thực: ' + err.message);
      setStatus('Lỗi xác thực');
      setIsScanning(false);
    }
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">👤</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Xác thực khuôn mặt
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Đưa khuôn mặt vào khung hình để đăng nhập
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Camera Preview */}
          <div className="mb-6">
            <div className="relative bg-gray-200 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Overlay khi đang quét */}
              {isScanning && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600 font-medium">Đang quét...</span>
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
            <button
              onClick={startFaceScan}
              disabled={isScanning || error.includes('camera')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? 'Đang xác thực...' : 'Bắt đầu quét khuôn mặt'}
            </button>

            <button
              onClick={handleCancel}
              disabled={isScanning}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Hủy
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Đảm bảo ánh sáng đủ để camera nhìn rõ khuôn mặt</li>
              <li>• Giữ khuôn mặt ở giữa khung hình</li>
              <li>• Không đeo khẩu trang hoặc che khuất mặt</li>
              <li>• Giữ nguyên tư thế trong vài giây</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
