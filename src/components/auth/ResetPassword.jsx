import React, { useState } from 'react';

const ResetPassword = ({ user, onSuccess, onCancel, resetType = 'reset' }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get user data from localStorage if user prop is null
  const currentUser = user || JSON.parse(localStorage.getItem('resetPasswordUser') || '{}');

  // Password validation rules
  const passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < passwordRules.minLength) {
      errors.push(`Mật khẩu phải có ít nhất ${passwordRules.minLength} ký tự`);
    }
    
    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }
    
    if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }
    
    if (passwordRules.requireNumber && !/\d/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 chữ số');
    }
    
    if (passwordRules.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
    }
    
    return errors;
  };

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

    // Validate passwords
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      setError(`Mật khẩu phải đúng định dạng vui lòng nhập lại:\n${passwordErrors.join('\n')}`);
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Update password in localStorage (in real app, this would be API call)
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
          users[userIndex].password = formData.newPassword;
          localStorage.setItem('mockUsers', JSON.stringify(users));
        }

        // Clear reset password data based on type
        if (resetType === 'reset') {
          localStorage.removeItem('resetPasswordOTP');
          localStorage.removeItem('resetPasswordUser');
          localStorage.removeItem('resetPasswordTimestamp');
        } else if (resetType === 'change') {
          localStorage.removeItem('changePasswordOTP');
          localStorage.removeItem('changePasswordEmail');
          localStorage.removeItem('changePasswordTimestamp');
        }

        setIsLoading(false);
        onSuccess();
      } catch (err) {
        setError('Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.');
        setIsLoading(false);
      }
    }, 1500);
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= passwordRules.minLength) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return {
      score,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      color: score < 2 ? 'red' : score < 4 ? 'yellow' : 'green'
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">🔒</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {resetType === 'change' ? 'Đổi mật khẩu' : 'Đặt lại mật khẩu'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {resetType === 'change' ? 'Tạo mật khẩu mới cho tài khoản của bạn' : 'Tạo mật khẩu mới cho tài khoản của bạn'}
        </p>
        <p className="mt-1 text-center text-sm text-green-600 font-medium">
          {currentUser.name || 'User'} ({currentUser.username || 'username'})
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <div className="mt-1 relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.color === 'red' ? 'bg-red-500' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength.level === 'weak' ? 'Yếu' : 
                       passwordStrength.level === 'medium' ? 'Trung bình' : 'Mạnh'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu mới
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang cập nhật...
                  </div>
                ) : (
                  'Cập nhật mật khẩu'
                )}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 bg-green-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-green-800 mb-2">Yêu cầu mật khẩu:</h4>
            <ul className="text-xs text-green-600 space-y-1">
              <li>• Ít nhất 8 ký tự</li>
              <li>• Có ít nhất 1 chữ hoa (A-Z)</li>
              <li>• Có ít nhất 1 chữ thường (a-z)</li>
              <li>• Có ít nhất 1 chữ số (0-9)</li>
              <li>• Có ít nhất 1 ký tự đặc biệt (!@#$%^&*)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
