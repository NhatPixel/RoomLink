import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Hệ thống quản lý Ký túc xá RoomLink
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Quản lý phòng ở, sinh viên và dịch vụ KTX một cách hiệu quả và chuyên nghiệp
          </p>
          <p className="text-lg text-gray-600">
            Chào mừng bạn đến với hệ thống quản lý KTX RoomLink
          </p>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Tính năng chính của hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý phòng ở</h3>
              <p className="text-gray-600">Đăng ký, phân bổ và theo dõi tình trạng phòng ở KTX</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý sinh viên</h3>
              <p className="text-gray-600">Theo dõi thông tin sinh viên và lịch sử ở KTX</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quản lý hóa đơn</h3>
              <p className="text-gray-600">Tạo và theo dõi hóa đơn điện nước, phí dịch vụ</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Xác thực khuôn mặt</h3>
              <p className="text-gray-600">Đăng nhập và xác thực bằng công nghệ nhận diện khuôn mặt</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Giao diện thân thiện</h3>
              <p className="text-gray-600">Thiết kế responsive, dễ sử dụng trên mọi thiết bị</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Báo cáo thống kê</h3>
              <p className="text-gray-600">Theo dõi và phân tích dữ liệu quản lý KTX</p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold text-center mb-8">Truy cập nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">👤</span>
              </div>
              <h3 className="font-semibold mb-2">Thông tin cá nhân</h3>
              <p className="text-sm text-blue-100">Cập nhật thông tin sinh viên</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-semibold mb-2">Hóa đơn</h3>
              <p className="text-sm text-blue-100">Xem và thanh toán hóa đơn</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="font-semibold mb-2">Quản trị</h3>
              <p className="text-sm text-blue-100">Quản lý hệ thống KTX</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
