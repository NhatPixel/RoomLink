import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import OTPVerification from '../../components/auth/OTPVerification';
import ResetPassword from '../../components/auth/ResetPassword';

const ForgotPassword = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [user, setUser] = useState(null);

  // Dữ liệu mẫu users với email
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
      name: 'Nguyễn Văn A',
      studentId: '22110390'
    },
    {
      id: 3,
      username: 'student002',
      email: 'student002@roomlink.com',
      role: 'student',
      name: 'Trần Thị B',
      studentId: '22110335'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      // Find user in mock data
      const user = mockUsers.find(u => 
        u.username === formData.username && 
        u.email === formData.email
      );

      if (user) {
        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP and user info in localStorage for verification
        localStorage.setItem('resetPasswordOTP', otp);
        localStorage.setItem('resetPasswordUser', JSON.stringify(user));
        localStorage.setItem('resetPasswordTimestamp', Date.now().toString());
        
        // Simulate sending email
        console.log(`OTP sent to ${user.email}: ${otp}`);
        
        // Show success message with OTP (for demo purposes)
        alert(`Mã OTP đã được gửi đến ${user.email}\nMã OTP: ${otp}\n(Vui lòng kiểm tra email trong thực tế)`);
        
        // Show OTP component instead of redirecting
        setUser(user);
        setShowOTP(true);
      } else {
        setError('Email và tên tài khoản không hợp lệ');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleOTPSuccess = () => {
    console.log('OTP verification successful');
    setShowOTP(false);
    setShowResetPassword(true);
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setUser(null);
  };

  const handleOTPResend = () => {
    console.log('Resend OTP');
    // In a real app, this would resend OTP
  };

  const handleResetPasswordSuccess = () => {
    console.log('Password reset successful');
    setShowResetPassword(false);
    setUser(null);
    onSuccess(user);
  };

  const handleResetPasswordCancel = () => {
    console.log('Password reset cancelled');
    setShowResetPassword(false);
    setUser(null);
  };

  // Show ResetPassword component if reset password step is active
  if (showResetPassword && user) {
    return (
      <ResetPassword 
        user={user}
        onSuccess={handleResetPasswordSuccess}
        onCancel={handleResetPasswordCancel}
        resetType="reset"
      />
    );
  }

  // Show OTP component if OTP step is active
  if (showOTP && user) {
    return (
      <OTPVerification 
        user={user}
        onSuccess={handleOTPSuccess}
        onCancel={handleOTPCancel}
        onResend={handleOTPResend}
        otpType="reset"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">🔑</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Quên mật khẩu
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập thông tin tài khoản để nhận mã OTP khôi phục mật khẩu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email khôi phục
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  placeholder="Nhập email đã đăng ký"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isLoading}
                loadingText="Đang gửi OTP..."
                fullWidth
              >
                Gửi mã OTP
              </Button>

              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                fullWidth
              >
                Hủy
              </Button>
            </div>
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
                <p className="text-xs text-gray-600">Tên đăng nhập: <span className="font-mono bg-gray-200 px-1 rounded">admin</span></p>
                <p className="text-xs text-gray-600">Email: <span className="font-mono bg-gray-200 px-1 rounded">admin@roomlink.com</span></p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-1">Sinh viên:</h4>
                <p className="text-xs text-gray-600">Tên đăng nhập: <span className="font-mono bg-gray-200 px-1 rounded">student001</span></p>
                <p className="text-xs text-gray-600">Email: <span className="font-mono bg-gray-200 px-1 rounded">student001@roomlink.com</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
