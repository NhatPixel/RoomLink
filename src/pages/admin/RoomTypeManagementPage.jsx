import React from 'react';
import RoomTypeManagement from '../../components/admin/RoomTypeManagement';

const RoomTypeManagementPage = ({ onSuccess, onCancel }) => {
  return (
    <RoomTypeManagement 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default RoomTypeManagementPage;
