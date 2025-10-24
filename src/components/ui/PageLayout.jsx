import React from 'react';
import PageHeader from './PageHeader';

const PageLayout = ({
  title,
  subtitle,
  onBack,
  onClose,
  onCancel,
  backText,
  closeText,
  cancelText,
  showBack = false,
  showClose = false,
  showCancel = false,
  children,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {(title || showBack || showClose || showCancel) && (
            <PageHeader
              title={title}
              subtitle={subtitle}
              onBack={onBack}
              onClose={onClose}
              onCancel={onCancel}
              backText={backText}
              closeText={closeText}
              cancelText={cancelText}
              showBack={showBack}
              showClose={showClose}
              showCancel={showCancel}
              className={headerClassName}
            />
          )}
          
          <div className={contentClassName}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
