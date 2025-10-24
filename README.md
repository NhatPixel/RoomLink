# RoomLink

Ứng dụng web tìm kiếm phòng trọ được xây dựng với ReactJS và Tailwind CSS.

## Tính năng

- 🔍 Tìm kiếm phòng trọ thông minh với bộ lọc đa dạng
- 🏠 Hiển thị danh sách phòng trọ với thông tin chi tiết
- 📱 Giao diện responsive, tối ưu cho mọi thiết bị
- ⭐ Đánh giá và xếp hạng phòng trọ
- 🎨 Thiết kế hiện đại với Tailwind CSS

## Công nghệ sử dụng

- **ReactJS** - Framework JavaScript
- **Vite** - Build tool nhanh chóng
- **Tailwind CSS** - CSS framework
- **PostCSS** - CSS processor

## Cài đặt và chạy

1. Clone repository:
```bash
git clone <repository-url>
cd RoomLink
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy ứng dụng:
```bash
npm run dev
```

4. Mở trình duyệt và truy cập `http://localhost:5173`

## Cấu trúc thư mục

```
src/
├── components/          # Các component tái sử dụng
│   ├── Header.jsx      # Header component
│   ├── Footer.jsx      # Footer component
│   ├── RoomCard.jsx    # Card hiển thị phòng trọ
│   └── SearchBar.jsx   # Thanh tìm kiếm
├── pages/              # Các trang chính
│   └── HomePage.jsx    # Trang chủ
├── assets/             # Hình ảnh và tài nguyên
├── utils/              # Các hàm tiện ích
├── App.jsx             # Component chính
├── App.css             # CSS tùy chỉnh
└── index.css           # CSS global với Tailwind
```

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build ứng dụng cho production
- `npm run preview` - Preview build production
- `npm run lint` - Chạy ESLint

## Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## License

MIT License