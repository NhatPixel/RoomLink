# 🎨 UI Components Guide

## 📋 **Danh sách Components đã tạo:**

### 1. **Loading Component**
```jsx
import Loading from '../components/ui/Loading';

// Sử dụng cơ bản
<Loading text="Đang tải..." />

// Với các tùy chọn
<Loading 
  size="large"           // small, medium, large
  text="Đang xử lý..."   // Text hiển thị
  fullScreen={true}      // Full screen overlay
  className="custom"     // Custom CSS class
/>
```

### 2. **Notification Component**
```jsx
import { useNotification } from '../contexts/NotificationContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const handleAction = () => {
    showSuccess('Thành công!');
    showError('Có lỗi xảy ra!');
    showWarning('Cảnh báo!');
    showInfo('Thông tin!');
  };

  return <button onClick={handleAction}>Click me</button>;
};
```

### 3. **Button Component**
```jsx
import Button from '../components/ui/Button';

// Các variant
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Với loading
<Button loading={true} loadingText="Đang xử lý...">
  Submit
</Button>

// Với icon
<Button 
  icon={<svg>...</svg>}
  iconPosition="left"  // hoặc "right"
>
  With Icon
</Button>

// Full width
<Button fullWidth={true}>Full Width</Button>
```

### 4. **PageHeader Component**
```jsx
import PageHeader from '../components/ui/PageHeader';

<PageHeader
  title="Tiêu đề trang"
  subtitle="Mô tả trang"
  showBack={true}
  showClose={true}
  showCancel={true}
  onBack={() => console.log('Back')}
  onClose={() => console.log('Close')}
  onCancel={() => console.log('Cancel')}
  backText="Quay lại"
  closeText="Đóng"
  cancelText="Hủy"
>
  {/* Custom content */}
</PageHeader>
```

### 5. **Modal Component**
```jsx
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Tiêu đề Modal"
  size="medium"  // small, medium, large, xlarge, full
  showCloseButton={true}
  closeOnOverlayClick={true}
>
  <ModalBody>
    Nội dung modal
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Hủy
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Xác nhận
    </Button>
  </ModalFooter>
</Modal>
```

### 6. **PageLayout Component**
```jsx
import PageLayout from '../components/ui/PageLayout';

<PageLayout
  title="Tiêu đề trang"
  subtitle="Mô tả trang"
  showBack={true}
  showClose={true}
  onBack={() => window.history.back()}
  onClose={() => window.location.href = '/admin'}
>
  {/* Nội dung trang */}
</PageLayout>
```

## 🔄 **Cách Migrate từ UI cũ sang UI mới:**

### **Trước (Old UI):**
```jsx
// Loading cũ
{loading ? (
  <div className="flex items-center">
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
      {/* SVG spinner */}
    </svg>
    Đang tải...
  </div>
) : (
  'Submit'
)}

// Alert cũ
alert('Thành công!');

// Button cũ
<button 
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
  disabled={loading}
>
  Submit
</button>
```

### **Sau (New UI):**
```jsx
// Loading mới
<Button loading={loading} loadingText="Đang tải...">
  Submit
</Button>

// Notification mới
const { showSuccess } = useNotification();
showSuccess('Thành công!');

// Button mới
<Button variant="primary" disabled={loading}>
  Submit
</Button>
```

## 📝 **Checklist Migration:**

- [ ] Thay thế tất cả `alert()` bằng `useNotification()`
- [ ] Thay thế loading spinner bằng `<Loading />` component
- [ ] Thay thế button cũ bằng `<Button />` component
- [ ] Thay thế header cũ bằng `<PageHeader />` component
- [ ] Thay thế modal cũ bằng `<Modal />` component
- [ ] Sử dụng `<PageLayout />` cho layout chuẩn
- [ ] Test tất cả các chức năng sau khi migrate

## 🎯 **Lợi ích:**

1. **Consistency**: Giao diện đồng nhất trên toàn web
2. **Maintainability**: Dễ bảo trì và cập nhật
3. **Reusability**: Tái sử dụng components
4. **Accessibility**: Hỗ trợ accessibility tốt hơn
5. **Performance**: Tối ưu performance
6. **Developer Experience**: Dễ phát triển và debug
