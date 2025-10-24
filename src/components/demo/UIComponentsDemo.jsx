import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import PageLayout from '../ui/PageLayout';
import Button from '../ui/Button';
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import Loading from '../ui/Loading';

const UIComponentsDemo = ({ onSuccess, onCancel }) => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoAction = (type) => {
    switch (type) {
      case 'success':
        showSuccess('Thành công! Đây là thông báo thành công.');
        break;
      case 'error':
        showError('Lỗi! Đây là thông báo lỗi.');
        break;
      case 'warning':
        showWarning('Cảnh báo! Đây là thông báo cảnh báo.');
        break;
      case 'info':
        showInfo('Thông tin! Đây là thông báo thông tin.');
        break;
    }
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showSuccess('Hoàn thành demo loading!');
    }, 3000);
  };

  return (
    <PageLayout
      title="Demo UI Components"
      subtitle="Các component UI chuẩn đã được tạo"
      showBack={true}
      showCancel={true}
      onBack={() => window.history.back()}
      onCancel={onCancel}
    >
      <div className="space-y-8">
        {/* Button Variants Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Button Variants</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>

        {/* Button Sizes Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Button Sizes</h3>
          <div className="flex items-center space-x-4">
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="medium">Medium</Button>
            <Button variant="primary" size="large">Large</Button>
          </div>
        </div>

        {/* Loading Button Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loading Button</h3>
          <Button 
            variant="primary" 
            loading={isLoading}
            loadingText="Đang xử lý..."
            onClick={handleLoadingDemo}
          >
            Demo Loading
          </Button>
        </div>

        {/* Notification Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="success" onClick={() => handleDemoAction('success')}>
              Success
            </Button>
            <Button variant="danger" onClick={() => handleDemoAction('error')}>
              Error
            </Button>
            <Button variant="warning" onClick={() => handleDemoAction('warning')}>
              Warning
            </Button>
            <Button variant="primary" onClick={() => handleDemoAction('info')}>
              Info
            </Button>
          </div>
        </div>

        {/* Modal Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Modal</h3>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Mở Modal
          </Button>
        </div>

        {/* Loading Component Demo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Loading Component</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Small</h4>
              <Loading size="small" text="Small loading" />
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Medium</h4>
              <Loading size="medium" text="Medium loading" />
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Large</h4>
              <Loading size="large" text="Large loading" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => {
            showSuccess('Demo hoàn thành!');
            if (onSuccess) onSuccess();
          }}>
            Hoàn thành Demo
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Demo Modal"
        size="medium"
      >
        <ModalBody>
          <p className="text-gray-600 mb-4">
            Đây là một modal demo sử dụng component Modal chuẩn.
          </p>
          <p className="text-gray-600">
            Modal này có thể đóng bằng cách nhấn nút X, nhấn ESC, hoặc click ra ngoài overlay.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={() => {
            setIsModalOpen(false);
            showSuccess('Modal action thành công!');
          }}>
            Xác nhận
          </Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
};

export default UIComponentsDemo;
