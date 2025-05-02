'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getPocketBase } from '@/lib/db/pocketbase';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Room {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  district: string;
  utilities: string[];
  roomType: 'private' | 'shared';
  photos: string[];
  aiScore?: number;
  aiAnalysis?: {
    diem: number;
    danh_gia: string;
  };
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const roomIds = searchParams.get('rooms')?.split(',') || [];
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (roomIds.length > 0) {
      fetchRooms();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const pb = getPocketBase();
      const records = await pb.collection('rental_rooms').getFullList({
        filter: roomIds.map(id => `id = "${id}"`).join(' || '),
      });
      
      setRooms(records);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải thông tin phòng trọ');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải thông tin phòng trọ...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (roomIds.length === 0 || rooms.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Không có phòng trọ để so sánh</p>
            <Link 
              href="/rooms" 
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Tìm kiếm phòng trọ
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">So sánh phòng trọ</h1>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-600 font-semibold border-b-2 border-gray-200 w-1/4">
                  Tiêu chí
                </th>
                {rooms.map((room) => (
                  <th key={room.id} className="px-4 py-2 border-b-2 border-gray-200">
                    <div className="text-center">
                      <div className="relative h-40 w-full mb-2">
                        {room.photos && room.photos.length > 0 ? (
                          <Image
                            src={room.photos[0]}
                            alt={room.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                            <span className="text-gray-500">Không có ảnh</span>
                          </div>
                        )}
                      </div>
                      <Link 
                        href={`/rooms/${room.id}`}
                        className="text-indigo-600 font-medium hover:text-indigo-800 break-words text-sm"
                      >
                        {room.title}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Giá thuê
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-price`} className="px-4 py-3 border-b border-gray-200 text-center">
                    <span className="text-lg font-bold text-indigo-600">
                      {room.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-gray-500 text-sm block">
                      / tháng
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Diện tích
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-area`} className="px-4 py-3 border-b border-gray-200 text-center">
                    <span className="font-medium">
                      {room.area} m²
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Giá / m²
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-price-per-m2`} className="px-4 py-3 border-b border-gray-200 text-center">
                    <span className="font-medium">
                      {Math.round(room.price / room.area).toLocaleString('vi-VN')}đ/m²
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Vị trí
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-location`} className="px-4 py-3 border-b border-gray-200 text-center">
                    <span className="text-gray-700">
                      {room.district || room.location}
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Loại phòng
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-type`} className="px-4 py-3 border-b border-gray-200 text-center">
                    <span className="text-gray-700">
                      {room.roomType === 'private' ? 'Phòng khép kín' : 'Phòng ghép'}
                    </span>
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Tiện ích
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-utilities`} className="px-4 py-3 border-b border-gray-200">
                    {room.utilities && room.utilities.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {room.utilities.map((utility, index) => (
                          <span 
                            key={`${room.id}-${utility}`} 
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {utility}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm text-center block">
                        Không có thông tin
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Điểm AI
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-ai-score`} className="px-4 py-3 border-b border-gray-200 text-center">
                    {room.aiScore ? (
                      <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                        {room.aiScore}/10
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Chưa đánh giá
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 border-b border-gray-200 font-medium text-gray-600">
                  Nhận xét
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-comment`} className="px-4 py-3 border-b border-gray-200 text-sm">
                    {room.aiAnalysis?.danh_gia || (
                      <span className="text-gray-500 text-sm text-center block">
                        Không có thông tin
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              
              <tr>
                <td className="px-4 py-3 font-medium text-gray-600">
                  Thao tác
                </td>
                {rooms.map((room) => (
                  <td key={`${room.id}-action`} className="px-4 py-3 text-center">
                    <Link 
                      href={`/rooms/${room.id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition inline-block"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
