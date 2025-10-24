import React from 'react';
import VehicleRegistrationApproval from '../../components/admin/VehicleRegistrationApproval';

const VehicleRegistrationApprovalPage = ({ onSuccess, onCancel }) => {
  return (
    <VehicleRegistrationApproval 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default VehicleRegistrationApprovalPage;
