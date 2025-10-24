import React from 'react';
import RoomCancellationApproval from '../../components/admin/RoomCancellationApproval';

const RoomCancellationApprovalPage = ({ onSuccess, onCancel }) => {
  return (
    <RoomCancellationApproval 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default RoomCancellationApprovalPage;
