import React from 'react';
import HealthCheckupCreation from '../../components/admin/HealthCheckupCreation';

const HealthCheckupCreationPage = ({ onSuccess, onCancel }) => {
  return (
    <HealthCheckupCreation 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default HealthCheckupCreationPage;
