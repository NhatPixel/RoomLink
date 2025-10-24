# 🔄 UI Synchronization Script

## 📋 **CÁC COMPONENT ĐÃ CẬP NHẬT:**

### ✅ **Hoàn thành:**
1. **RoomCancellationPage** - Sử dụng Button component
2. **RoomRegistrationPage** - Sử dụng Button component  
3. **RoomCancellationApproval** - Sử dụng PageHeader
4. **PaymentPage** - Sử dụng Button component
5. **RoomTransferPage** - Sử dụng Button component
6. **ElectricityWaterBillCreation** - Sử dụng Button component

### 🔄 **Cần cập nhật tiếp:**

#### **High Priority:**
- `RoomExtensionPage.jsx` - Button styling
- `BillsViewPage.jsx` - Button styling
- `FeesViewPage.jsx` - Button styling
- `EditProfilePage.jsx` - Button styling
- `FaceRegistrationPage.jsx` - Button styling
- `ChangePasswordPage.jsx` - Button styling
- `ForgotPasswordPage.jsx` - Button styling

#### **Medium Priority:**
- `RoomSelection.jsx` - Button styling
- `VehicleRegistration.jsx` - Button styling
- `HealthCheckupRegistration.jsx` - Button styling
- `ExtensionApproval.jsx` - Button styling
- `RoomRegistrationApproval.jsx` - Button styling
- `VehicleRegistrationApproval.jsx` - Button styling
- `RoomTypeManagement.jsx` - Button styling
- `CreateAdminAccount.jsx` - Button styling
- `RoomManagement.jsx` - Button styling
- `HealthCheckupCreation.jsx` - Button styling

## 🎯 **PATTERN CẦN THAY THẾ:**

### **Button cũ:**
```jsx
<button
  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
>
  Quay lại
</button>

<button
  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
>
  Submit
</button>

<button
  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
>
  Hủy
</button>
```

### **Button mới:**
```jsx
<Button variant="outline">
  Quay lại
</Button>

<Button variant="primary">
  Submit
</Button>

<Button variant="danger">
  Hủy
</Button>
```

### **Loading button cũ:**
```jsx
<button disabled={loading}>
  {loading ? (
    <div className="flex items-center">
      <svg className="animate-spin...">...</svg>
      Đang xử lý...
    </div>
  ) : (
    'Submit'
  )}
</button>
```

### **Loading button mới:**
```jsx
<Button loading={loading} loadingText="Đang xử lý...">
  Submit
</Button>
```

## 🚀 **CÁCH MIGRATE NHANH:**

### **1. Import Button component:**
```jsx
import Button from '../ui/Button'; // hoặc '../../components/ui/Button'
```

### **2. Thay thế button cũ:**
- `variant="outline"` cho nút "Quay lại", "Hủy"
- `variant="primary"` cho nút submit chính
- `variant="danger"` cho nút xóa/hủy nguy hiểm
- `variant="success"` cho nút xác nhận
- `variant="secondary"` cho nút phụ

### **3. Thêm loading state:**
```jsx
<Button 
  loading={isLoading}
  loadingText="Đang xử lý..."
>
  Submit
</Button>
```

## 📊 **TIẾN ĐỘ HOÀN THÀNH:**

- ✅ **6/20 components** đã được cập nhật (30%)
- 🔄 **14/20 components** còn lại cần cập nhật (70%)

## 🎯 **MỤC TIÊU:**

Đạt **100% đồng bộ UI** với:
- ✅ Tất cả button sử dụng `<Button />` component
- ✅ Tất cả loading sử dụng `loading` prop
- ✅ Tất cả header sử dụng `<PageHeader />` component
- ✅ Tất cả notification sử dụng `useNotification()` hook
- ✅ Tất cả modal sử dụng `<Modal />` component
