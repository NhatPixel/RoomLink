import React from 'react';
import Button from '../ui/Button';
import defaultRoomImage from '../../assets/default_room.png';

const RoomCard = ({ room }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={room.image || defaultRoomImage} 
          alt={room.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
          {room.price} triệu/tháng
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{room.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{room.address}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>🏠 {room.type}</span>
          <span>📐 {room.area}m²</span>
          <span>👥 {room.capacity} người</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-500">⭐</span>
            <span className="text-sm text-gray-600">{room.rating}</span>
          </div>
          <Button 
            variant="primary"
            size="small"
          >
            Xem chi tiết
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
