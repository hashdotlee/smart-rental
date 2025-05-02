import Link from 'next/link';
import Image from 'next/image';

interface RoomCardProps {
  room: {
    id: string;
    title: string;
    price: number;
    area: number;
    location: string;
    utilities: string[];
    roomType: string;
    photos: string[];
    aiScore?: number;
  };
}

export default function RoomCard({ room }: RoomCardProps) {
  const defaultImage = '/images/room-placeholder.jpg';
  const roomImage = room.photos && room.photos.length > 0 ? room.photos[0] : defaultImage;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={roomImage}
          alt={room.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {room.title}
          </h3>
          {room.aiScore && (
            <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              {room.aiScore}/10
            </div>
          )}
        </div>
        
        <div className="mb-3">
          <p className="text-xl font-bold text-indigo-600">
            {room.price.toLocaleString('vi-VN')} đ/tháng
          </p>
          <p className="text-gray-500 text-sm">
            {room.area} m² - {room.roomType === 'private' ? 'Phòng khép kín' : 'Phòng ghép'}
          </p>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {room.location}
        </p>
        
        {room.utilities && room.utilities.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Tiện ích:</p>
            <div className="flex flex-wrap gap-1">
              {room.utilities.slice(0, 3).map((util, index) => (
                <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {util}
                </span>
              ))}
              {room.utilities.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  +{room.utilities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
        
        <Link 
          href={`/rooms/${room.id}`}
          className="block w-full text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
