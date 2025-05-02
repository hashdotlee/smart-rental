'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RoomCard from '@/app/rooms/components/RoomCard';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface SavedRoom {
  id: string;
  room: string;
  notes: string;
  created: string;
  expand?: {
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
  };
}

export default function SavedRoomsPage() {
  const [savedRooms, setSavedRooms] = useState<SavedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useSession();
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSavedRooms();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);
  
  const fetchSavedRooms = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/saved-rooms');
      if (!response.ok) throw new Error('Failed to fetch saved rooms');
      
      const data = await response.json();
      setSavedRooms(data.items);
    } catch (error) {
      console.error('Error fetching saved rooms:', error);
      toast.error('Không thể tải danh sách phòng đã lưu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (roomId: string) => {
    try {
      const response = await fetch('/api/saved-rooms', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });
      
      if (!response.ok) throw new Error('Failed to remove room from saved list');
      
      // Cập nhật danh sách
      setSavedRooms(prev => prev.filter(item => item.room !== roomId));
      toast.success('Đã xóa phòng khỏi danh sách yêu thích');
    } catch (error) {
      console.error('Error removing saved room:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    }
  };
  
  if (status === 'loading' || (loading && status === 'authenticated')) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải danh sách phòng đã lưu...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem danh sách phòng đã lưu</p>
            <Link 
              href="/login" 
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Đăng nhập
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
        <h1 className="text-3xl font-bold mb-6">Phòng trọ đã lưu</h1>
        
        {savedRooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Bạn chưa lưu phòng trọ nào</p>
            <Link 
              href="/rooms" 
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Tìm kiếm phòng trọ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedRooms.map((savedRoom) => (
              savedRoom.expand?.room ? (
                <div key={savedRoom.id} className="relative">
                  <RoomCard room={savedRoom.expand.room} />
                  <button
                    onClick={() => handleRemove(savedRoom.room)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-700 transition"
                    title="Xóa khỏi danh sách đã lưu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : null
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
