import React from 'react';
import ElectricityWaterBillCreation from '../../components/admin/ElectricityWaterBillCreation';

const ElectricityWaterBillCreationPage = ({ onSuccess, onCancel }) => {
  return (
    <ElectricityWaterBillCreation 
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default ElectricityWaterBillCreationPage;
