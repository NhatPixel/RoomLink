import React, { useState } from 'react';
import Button from './Button';

const RejectionModal = ({ isOpen, onClose, onConfirm, title = "Nhập lý do từ chối" }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="small"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do từ chối <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối chi tiết..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {reason.length}/500 ký tự
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="danger"
            loading={loading}
            loadingText="Đang từ chối..."
          >
            Xác nhận từ chối
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
