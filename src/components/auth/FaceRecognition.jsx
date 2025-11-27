import React, { useState, useRef, useEffect } from 'react';
import { hasFace } from '../../services/faceDetectionService';
import { authApi, userApi } from '../../api';
import { setTokenGetter } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../layout/AuthLayout';
import Button from '../ui/Button';
import InfoBox from '../ui/InfoBox';

const FaceRecognition = ({ onSuccess, onCancel }) => {
  const { login: authLogin } = useAuth();
  const { showSuccess, showError } = useNotification();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const isApiCallingRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasFaceDetected, setHasFaceDetected] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Chuẩn bị quét khuôn mặt...');


  useEffect(() => {
    startCamera();

    return () => {
      // Cleanup when component unmounts
      stopCamera();
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
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
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        setStatus('Camera đã sẵn sàng. Đang quét khuôn mặt...');
        
        videoRef.current.onloadedmetadata = () => {
          startContinuousScan();
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Hiện tại không thể mở camera. Vui lòng kiểm tra quyền truy cập camera.');
      setStatus('Lỗi camera');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      streamRef.current = null;
    }
  
    if (videoRef.current) {
      const v = videoRef.current;
      v.pause();
      v.srcObject = null;
      v.removeAttribute("src");
      setTimeout(() => v.load(), 0);
    }
  };

  const captureFaceAsBlob = () => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        resolve(null);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const callFaceLoginAPI = async (blob) => {
    if (isApiCallingRef.current) {
      return;
    }

    try {
      isApiCallingRef.current = true;
      setStatus('Đang xác thực khuôn mặt...');

      const formData = new FormData();
      formData.append('face', blob, 'face.jpg');

      const response = await authApi.loginFace(formData);
      const access_token = response.data.access_token;
      const userId = response.data.userId;

      if (!access_token) {
        throw new Error('Không nhận được token từ server');
      }

      localStorage.setItem('token', access_token);
      setTokenGetter(() => localStorage.getItem('token'));

      const userResponse = await userApi.getUser();
      const userData = userResponse.data;

      const tokenPayload = JSON.parse(atob(access_token.split('.')[1]));
      const roleId = tokenPayload.roleId;

      const user = {
        ...userData,
        id: userId || userData.id,
        roleId: roleId
      };

      authLogin(user, access_token);
      showSuccess('Đăng nhập thành công!');

      setTimeout(() => {
        if (user.status === 'APPROVED_NOT_CHANGED') {
          window.location.href = '/change-password';
        } else {
          if (user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/student';
          }
        }
      }, 1000);
    } catch (err) {
      console.error('Face login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xác thực khuôn mặt';
      showError(errorMessage);
      setStatus('Xác thực thất bại. Vui lòng thử lại.');
      isApiCallingRef.current = false;
    }
  };

  const startContinuousScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    setIsScanning(true);
    setStatus('Đang quét khuôn mặt...');

    scanIntervalRef.current = setInterval(async () => {
      try {
        if (isApiCallingRef.current) {
          return;
        }

        if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
          return;
        }

        const blob = await captureFaceAsBlob();
        
        if (!blob) {
          setHasFaceDetected(false);
          setStatus('Chưa phát hiện khuôn mặt. Vui lòng đưa khuôn mặt vào khung hình.');
          return;
        }

        const faceDetected = await hasFace(blob);
        setHasFaceDetected(faceDetected);

        if (faceDetected) {
          setStatus('✓ Đã phát hiện khuôn mặt');
          await callFaceLoginAPI(blob);
        } else {
          setStatus('Chưa phát hiện khuôn mặt. Vui lòng đưa khuôn mặt vào khung hình.');
        }
      } catch (err) {
        console.error('Error scanning face:', err);
        setHasFaceDetected(false);
        setStatus('Lỗi khi quét khuôn mặt. Vui lòng thử lại.');
        isApiCallingRef.current = false;
      }
    }, 500);
  };


  const handleCancel = () => {
    // Stop camera immediately before redirect
    stopCamera();
    
    // Redirect to login page - component will unmount and cleanup will run
    window.location.href = '/login';
  };

  return (
    <AuthLayout
      icon="👤"
      title="Xác thực khuôn mặt"
      subtitle="Đưa khuôn mặt vào khung hình để đăng nhập"
    >
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
              
              {/* Overlay trạng thái khuôn mặt */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {hasFaceDetected ? (
                  <div className="bg-green-500 bg-opacity-20 rounded-lg p-4 border-2 border-green-500">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-700 font-bold text-lg">Đã phát hiện khuôn mặt</span>
                    </div>
                  </div>
                ) : isScanning ? (
                  <div className="bg-yellow-500 bg-opacity-20 rounded-lg p-4 border-2 border-yellow-500">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                      <span className="text-yellow-700 font-medium">Đang quét...</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <p className="text-center text-sm text-gray-600">{status}</p>
          </div>

          {error && (
            <div className="mb-4">
              <InfoBox type="error" messages={[error]} />
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              fullWidth
            >
              Hủy
            </Button>
          </div>

          <div className="mt-6">
            <InfoBox
              type="info"
              title="Hướng dẫn"
              messages={[
                'Đảm bảo ánh sáng đủ để camera nhìn rõ khuôn mặt',
                'Giữ khuôn mặt ở giữa khung hình',
                'Không đeo khẩu trang hoặc che khuất mặt',
                'Giữ nguyên tư thế trong vài giây'
              ]}
            />
          </div>
        </AuthLayout>
  );
};

export default FaceRecognition;
