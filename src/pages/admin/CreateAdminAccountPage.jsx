import React from 'react';
import CreateAdminAccount from '../../components/admin/CreateAdminAccount';

const CreateAdminAccountPage = ({ onSuccess, onCancel }) => {
  return (
    <CreateAdminAccount 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default CreateAdminAccountPage;
