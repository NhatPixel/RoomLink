import React from 'react';
import RoomRegistrationApproval from '../../components/admin/RoomRegistrationApproval';

const RoomRegistrationApprovalPage = ({ onSuccess, onCancel }) => {
  const handleSuccess = (approvalData) => {
    console.log('Room registration approval successful:', approvalData);
    if (onSuccess) {
      onSuccess(approvalData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <RoomRegistrationApproval 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default RoomRegistrationApprovalPage;
