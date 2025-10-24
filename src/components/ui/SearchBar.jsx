import React from 'react';

const SearchBar = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Tìm phòng trọ phù hợp</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Chọn thành phố</option>
            <option value="hanoi">Hà Nội</option>
            <option value="hcm">TP. Hồ Chí Minh</option>
            <option value="danang">Đà Nẵng</option>
            <option value="cantho">Cần Thơ</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="studio">Studio</option>
            <option value="1bedroom">1 phòng ngủ</option>
            <option value="2bedroom">2 phòng ngủ</option>
            <option value="shared">Phòng chung</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Giá thuê</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Tất cả</option>
            <option value="1-3">1-3 triệu</option>
            <option value="3-5">3-5 triệu</option>
            <option value="5-10">5-10 triệu</option>
            <option value="10+">Trên 10 triệu</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            🔍 Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
