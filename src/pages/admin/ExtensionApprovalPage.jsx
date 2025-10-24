import React from 'react';
import ExtensionApproval from '../../components/admin/ExtensionApproval';

const ExtensionApprovalPage = ({ onSuccess, onCancel }) => {
  const handleSuccess = (approvalData) => {
    console.log('Extension approval successful:', approvalData);
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
    <ExtensionApproval 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default ExtensionApprovalPage;
