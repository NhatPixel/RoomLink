import React, { useState } from 'react';
import PlateRecognition from '../../components/vehicle/PlateRecognition';
import { useNotification } from '../../contexts/NotificationContext';

const PlateDetectionPage = ({ onCancel }) => {
  const { showSuccess, showError } = useNotification();
  const [detectionResult, setDetectionResult] = useState(null);

  const handleDetectionSuccess = (result) => {
    console.log('Plate detection successful:', result);
    setDetectionResult(result);
    showSuccess('Đã phát hiện biển số xe!');
  };

  const handleCancelInternal = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <PlateRecognition
      onSuccess={handleDetectionSuccess}
      onCancel={handleCancelInternal}
    />
  );
};

export default PlateDetectionPage;

