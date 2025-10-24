import React from 'react';
import RoomManagement from '../../components/admin/RoomManagement';

const RoomManagementPage = ({ onSuccess, onCancel }) => {
  return (
    <RoomManagement 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default RoomManagementPage;
