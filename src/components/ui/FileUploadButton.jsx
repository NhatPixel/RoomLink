import React, { useRef } from 'react';
import Button from './Button';

const FileUploadButton = ({
  accept,
  onChange,
  children = 'Chọn tệp',
  icon,
  disabled = false,
  className = '',
  ...props
}) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onChange) {
      onChange(file, event);
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        {...props}
      />
      <Button
        variant="file"
        onClick={handleClick}
        disabled={disabled}
        icon={icon}
        fullWidth
      >
        {children}
      </Button>
    </div>
  );
};

export default FileUploadButton;
