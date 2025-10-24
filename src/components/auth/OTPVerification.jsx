import React, { useState, useEffect } from 'react';

const OTPVerification = ({ user, onSuccess, onCancel, onResend, otpType = 'reset' }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const MAX_ATTEMPTS = 5;
  const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
  const RESEND_COOLDOWN_TIME = 60; // 60 seconds

  // Determine OTP keys based on type
  const otpKey = otpType === 'change' ? 'changePasswordOTP' : 'resetPasswordOTP';
  const timestampKey = otpType === 'change' ? 'changePasswordTimestamp' : 'resetPasswordTimestamp';
  const userKey = otpType === 'change' ? 'changePasswordEmail' : 'resetPasswordUser';

  // Get user data from localStorage if user prop is null
  const currentUser = user || JSON.parse(localStorage.getItem(userKey) || '{}');

  useEffect(() => {
    // Check if OTP is expired
    const timestamp = localStorage.getItem(timestampKey);
    if (timestamp) {
      const elapsed = Date.now() - parseInt(timestamp);
      if (elapsed > OTP_EXPIRY_TIME) {
        setError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    }

    // Start resend cooldown timer
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel, timestampKey]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Bạn đã đạt quá số lần thử. Vui lòng thử lại sau.');
      return;
    }

    if (otp.length !== 6) {
      setError('Mã OTP phải có 6 chữ số');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      const storedOTP = localStorage.getItem(otpKey);
      
      if (otp === storedOTP) {
        // OTP is correct
        setIsLoading(false);
        onSuccess();
      } else {
        // OTP is incorrect
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          setError('Bạn đã đạt quá số lần thử');
        } else {
          setError(`OTP không chính xác, vui lòng thử lại. (${newAttempts}/${MAX_ATTEMPTS})`);
        }
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0) return;
    
    setResendCooldown(RESEND_COOLDOWN_TIME);
    setError('');
    
    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(otpKey, newOTP);
    localStorage.setItem(timestampKey, Date.now().toString());
    
    console.log(`New OTP sent to ${currentUser.email || 'email@example.com'}: ${newOTP}`);
    alert(`Mã OTP mới đã được gửi đến ${currentUser.email || 'email@example.com'}\nMã OTP: ${newOTP}`);
    
    onResend(newOTP);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">📧</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Xác thực OTP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập mã OTP đã được gửi đến email của bạn
        </p>
        <p className="mt-1 text-center text-sm text-blue-600 font-medium">
          {currentUser.email || 'email@example.com'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Mã OTP (6 chữ số)
              </label>
              <div className="mt-1">
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={handleChange}
                  maxLength="6"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Nhập mã OTP 6 chữ số đã được gửi đến email của bạn
              </p>
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-md text-sm ${
                error.includes('quá số lần') || error.includes('hết hạn') 
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : 'bg-yellow-50 border border-yellow-200 text-yellow-600'
              }`}>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || isBlocked || otp.length !== 6}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xác thực...
                  </div>
                ) : (
                  'Xác thực OTP'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isBlocked}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {resendCooldown > 0 ? `Gửi lại sau ${formatTime(resendCooldown)}` : 'Gửi lại mã OTP'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn:</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Kiểm tra email và spam folder</li>
              <li>• Mã OTP có hiệu lực trong 5 phút</li>
              <li>• Bạn có tối đa 5 lần thử</li>
              <li>• Có thể yêu cầu gửi lại mã sau 1 phút</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
