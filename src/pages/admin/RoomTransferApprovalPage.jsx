import React from 'react';
import RoomTransferApproval from '../../components/admin/RoomTransferApproval';

const RoomTransferApprovalPage = ({ onSuccess, onCancel }) => {
  return (
    <RoomTransferApproval 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default RoomTransferApprovalPage;
