import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import FaceRecognition from '../../components/auth/FaceRecognition';

const LoginPage = () => {
  const [showFaceLogin, setShowFaceLogin] = useState(false);

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/student';
    }
  };

  const handleFaceLogin = () => {
    setShowFaceLogin(true);
  };

  const handleFaceLoginSuccess = (userData) => {
    console.log('Face login successful:', userData);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/student';
    }
  };

  const handleFaceLoginCancel = () => {
    setShowFaceLogin(false);
  };

  // Forgot Password handlers
  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
  };

  // Render different components based on state
  if (showFaceLogin) {
    return (
      <FaceRecognition 
        onSuccess={handleFaceLoginSuccess}
        onCancel={handleFaceLoginCancel}
      />
    );
  }

  return (
    <div>
      <LoginForm 
        onLogin={handleLogin} 
        onFaceLogin={handleFaceLogin}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
};

export default LoginPage;
