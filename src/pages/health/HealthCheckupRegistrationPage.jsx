import React from 'react';
import HealthCheckupRegistration from '../../components/health/HealthCheckupRegistration';

const HealthCheckupRegistrationPage = ({ onSuccess, onCancel }) => {
  const handleSuccess = (registrationData) => {
    console.log('Health checkup registration successful:', registrationData);
    if (onSuccess) {
      onSuccess(registrationData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <HealthCheckupRegistration 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default HealthCheckupRegistrationPage;
