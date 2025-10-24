import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import OTPVerification from '../../components/auth/OTPVerification';
import ResetPassword from '../../components/auth/ResetPassword';

const ChangePassword = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState('email'); // email, otp, resetPassword
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isOtpBlocked, setIsOtpBlocked] = useState(false);
  const { user } = useAuth();

  const MAX_OTP_ATTEMPTS = 5;

  // Mock user data with emails
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@roomlink.com',
      role: 'admin',
      name: 'Quản trị viên'
    },
    {
      id: 2,
      username: 'student001',
      email: 'student001@roomlink.com',
      role: 'student',
      name: 'Nguyễn Văn A'
    },
    {
      id: 3,
      username: 'student002',
      email: 'student002@roomlink.com',
      role: 'student',
      name: 'Trần Thị B'
    }
  ];

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Vui lòng nhập Email hợp lệ!');
      setIsLoading(false);
      return;
    }

    // Check if email exists in mock data
    const userExists = mockUsers.find(u => u.email === email);
    if (!userExists) {
      setError('Email không tồn tại trong hệ thống');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Generate OTP (6 digits)
        const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP and user info in localStorage
        localStorage.setItem('changePasswordOTP', generatedOTP);
        localStorage.setItem('changePasswordEmail', email);
        localStorage.setItem('changePasswordTimestamp', Date.now().toString());
        
        // Simulate sending email
        console.log(`OTP sent to ${email}: ${generatedOTP}`);
        
        // Show success message with OTP (for demo purposes)
        alert(`Mã OTP đã được gửi đến ${email}\nMã OTP: ${generatedOTP}\n(Vui lòng kiểm tra email trong thực tế)`);
        
        // Show OTP step instead of redirecting
        setCurrentStep('otp');
        setIsLoading(false);
      } catch (err) {
        setError('Hiện tại không thể gửi email, vui lòng thử lại sau');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (isOtpBlocked) {
      setError('Bạn đã đạt giới hạn thử OTP, vui lòng thử lại sau');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP phải có 6 chữ số');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      const storedOTP = localStorage.getItem('changePasswordOTP');
      
      if (otp === storedOTP) {
        // OTP is correct
        setCurrentStep('newPassword');
        setIsLoading(false);
      } else {
        // OTP is incorrect
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);
        
        if (newAttempts >= MAX_OTP_ATTEMPTS) {
          setIsOtpBlocked(true);
          setError('Bạn đã đạt giới hạn thử OTP, vui lòng thử lại sau');
        } else {
          setError(`OTP sai hoặc không hợp lệ, vui lòng thử lại (${newAttempts}/${MAX_OTP_ATTEMPTS})`);
        }
        setIsLoading(false);
      }
    }, 1000);
  };


  const handleCancel = () => {
    // Clear all data
    localStorage.removeItem('changePasswordOTP');
    localStorage.removeItem('changePasswordEmail');
    localStorage.removeItem('changePasswordTimestamp');
    
    if (onCancel) {
      onCancel();
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email khôi phục mật khẩu
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nhập email đã đăng ký"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleEmailSubmit}
          loading={isLoading}
          loadingText="Đang gửi..."
          disabled={!email}
        >
          Gửi mã OTP
        </Button>
      </div>
    </div>
  );

  const handleOTPSuccess = () => {
    console.log('OTP verification successful');
    setCurrentStep('resetPassword');
  };

  const handleOTPCancel = () => {
    setCurrentStep('email');
    setOtp('');
    setError('');
  };

  const handleOTPResend = () => {
    console.log('Resend OTP');
    // In a real app, this would resend OTP
  };

  const handleResetPasswordSuccess = () => {
    console.log('Password change successful');
    setCurrentStep('email');
    onSuccess();
  };

  const handleResetPasswordCancel = () => {
    console.log('Password change cancelled');
    setCurrentStep('email');
  };

  // Show ResetPassword component if reset password step is active
  if (currentStep === 'resetPassword') {
    const mockUser = { email: email };
    return (
      <ResetPassword 
        user={mockUser}
        onSuccess={handleResetPasswordSuccess}
        onCancel={handleResetPasswordCancel}
        resetType="change"
      />
    );
  }

  // Show OTP component if OTP step is active
  if (currentStep === 'otp') {
    const mockUser = { email: email };
    return (
      <OTPVerification 
        user={mockUser}
        onSuccess={handleOTPSuccess}
        onCancel={handleOTPCancel}
        onResend={handleOTPResend}
        otpType="change"
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">🔒</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {currentStep === 'email' && 'Nhập email để nhận mã OTP khôi phục mật khẩu'}
            {currentStep === 'otp' && 'Nhập mã OTP đã được gửi đến email của bạn'}
          </p>
          {user && (
            <p className="mt-1 text-center text-sm text-blue-600 font-medium">
              Tài khoản: {user.name} ({user.username})
            </p>
          )}
        </div>

        <form onSubmit={handleEmailSubmit}>
          {currentStep === 'email' && renderEmailStep()}
        </form>

        {/* Demo Accounts */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Tài khoản mẫu</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Quản trị viên:</h4>
              <p className="text-xs text-gray-600">Email: <span className="font-mono bg-gray-200 px-1 rounded">admin@roomlink.com</span></p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Sinh viên:</h4>
              <p className="text-xs text-gray-600">Email: <span className="font-mono bg-gray-200 px-1 rounded">student001@roomlink.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
