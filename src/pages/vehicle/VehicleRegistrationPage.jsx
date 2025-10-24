import React from 'react';
import VehicleRegistration from '../../components/vehicle/VehicleRegistration';

const VehicleRegistrationPage = ({ onSuccess, onCancel }) => {
  const handleSuccess = (vehicleData) => {
    console.log('Vehicle registration successful:', vehicleData);
    if (onSuccess) {
      onSuccess(vehicleData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <VehicleRegistration 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default VehicleRegistrationPage;
