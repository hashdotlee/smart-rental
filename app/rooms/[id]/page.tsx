'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SaveRoomButton from '@/components/rooms/SaveRoomButton';
import { useParams, useRouter } from 'next/navigation';
import { getPocketBase } from '@/lib/db/pocketbase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  location: string;
  district: string;
  utilities: string[];
  roomType: string;
  photos: string[];
  aiScore?: number;
  aiAnalysis?: {
    dien_tich: number;
    vi_tri: string;
    gia: number;
    tien_ich: string[];
    loai_phong: string;
    danh_gia: string;
    diem: number;
  };
  sourceUrl: string;
  sourceType: string;
  available: boolean;
  created: string;
  latitude?: number;
  longitude?: number;
}

export default function RoomDetailPage() {
  const params = useParams() as {id: string};
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  
  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        setLoading(true);
        
        const pb = getPocketBase();
        const record = await pb.collection<Room>('rental_rooms').getOne(params.id!);
        
        setRoom(record);
      } catch (error) {
        console.error('Error fetching room detail:', error);
        setError('Không thể tải thông tin phòng trọ');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomDetail();
  }, [params.id]);
  
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
  
  if (error || !room) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-red-500 mb-4">{error || 'Không tìm thấy thông tin phòng trọ'}</p>
            <button
              onClick={() => router.push('/rooms')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Quay lại danh sách phòng
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link 
            href="/rooms" 
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            &larr; Quay lại danh sách phòng
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Hình ảnh phòng */}
          <div className="relative h-96">
            {room.photos && room.photos.length > 0 ? (
              <Image
                src={room.photos[0]}
                alt={room.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Không có hình ảnh</p>
              </div>
            )}
          </div>
          
          <div className="p-6">
			<div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
			  <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">
				{room.title}
			  </h1>
			  
			  <div className="flex space-x-2">
				<SaveRoomButton roomId={room.id} />
				
				{room.aiScore && (
				  <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-lg font-semibold">
					Điểm AI: {room.aiScore}/10
				  </div>
				)}
			  </div>
			</div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border-r border-gray-200 pr-6">
                <p className="text-gray-500 mb-1">Giá thuê</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {room.price.toLocaleString('vi-VN')} đ/tháng
                </p>
              </div>
              
              <div className="md:border-r border-gray-200 pr-6">
                <p className="text-gray-500 mb-1">Diện tích</p>
                <p className="text-2xl font-bold">
                  {room.area} m²
                </p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Loại phòng</p>
                <p className="text-2xl font-bold">
                  {room.roomType === 'private' ? 'Phòng khép kín' : 'Phòng ghép'}
                </p>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Địa chỉ</h2>
              <p className="text-gray-700">{room.location}</p>
              
              {/* Google Map sẽ được phát triển sau */}
              {(room.latitude && room.longitude) ? (
                <div className="mt-4 h-64 bg-gray-200 rounded-lg">
                  <p className="text-center p-4 text-gray-500">
                    Bản đồ Google Maps sẽ hiển thị tại đây
                  </p>
                </div>
              ) : null}
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {room.description}
              </div>
            </div>
            
            {room.utilities && room.utilities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Tiện ích</h2>
                <div className="flex flex-wrap gap-2">
                  {room.utilities.map((util, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                    >
                      {util}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {room.aiAnalysis && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Đánh giá AI</h2>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-700 mb-2">{room.aiAnalysis.danh_gia}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-500 text-sm">Đánh giá giá cả:</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${(room.aiAnalysis.gia / room.price) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {room.aiAnalysis.gia.toLocaleString()} đ
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm">Đánh giá diện tích:</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${(room.aiAnalysis.dien_tich / room.area) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          {room.aiAnalysis.dien_tich} m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-500">
              <div>
                <p>Nguồn: {room.sourceType === 'chotot' ? 'Chợ Tốt' : 'Facebook'}</p>
                <p>Ngày đăng: {formatDate(room.created)}</p>
              </div>
              
              <a 
                href={room.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 md:mt-0 text-indigo-600 hover:text-indigo-800"
              >
                Xem bài đăng gốc
              </a>
            </div>
            
            {session && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link
                  href="/criteria/new"
                  className="block w-full md:w-auto md:inline-block text-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Tìm phòng tương tự
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
