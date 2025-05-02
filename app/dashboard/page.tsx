'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPocketBase } from '@/lib/db/pocketbase';
import toast from 'react-hot-toast';

interface Criteria {
  id: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  utilities: string[];
  roomType: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  active: boolean;
  created: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCriteria = async () => {
      if (!session?.user?.id) return;
      
      try {
        const pb = getPocketBase();
        const records: Criteria[] = await pb.collection('room_criteria').getFullList({
          filter: `user = "${session.user.id}"`,
          sort: '-created',
        });
        
        setCriteria(records);
      } catch (error) {
        console.error('Error fetching criteria:', error);
        toast.error('Không thể tải tiêu chí tìm kiếm');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCriteria();
  }, [session]);
  
  const toggleCriteriaStatus = async (id: string, active: boolean) => {
    try {
      const pb = getPocketBase();
      await pb.collection('room_criteria').update(id, { active: !active });
      
      // Cập nhật state
      setCriteria(prev => 
        prev.map(item => 
          item.id === id ? { ...item, active: !active } : item
        )
      );
      
      toast.success(active ? 'Đã tạm dừng tiêu chí' : 'Đã kích hoạt tiêu chí');
    } catch (error) {
      console.error('Error toggling criteria status:', error);
      toast.error('Không thể cập nhật trạng thái tiêu chí');
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
          <Link 
            href="/criteria/new" 
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
          >
            Thêm tiêu chí mới
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tiêu chí tìm kiếm của bạn</h2>
          
          {loading ? (
            <p className="text-gray-500">Đang tải...</p>
          ) : criteria.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Bạn chưa có tiêu chí tìm kiếm nào</p>
              <Link 
                href="/criteria/new" 
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Tạo tiêu chí đầu tiên
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá (VNĐ)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diện tích (m²)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại phòng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {criteria.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.minPrice.toLocaleString()} - {item.maxPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.minArea} - {item.maxArea}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.roomType === 'private' ? 'Phòng khép kín' : 
                         item.roomType === 'shared' ? 'Phòng ghép' : 'Tất cả'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
					  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.active ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/criteria/${item.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => toggleCriteriaStatus(item.id, item.active)}
                            className={`${
                              item.active 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {item.active ? 'Tạm dừng' : 'Kích hoạt'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Thông báo gần đây</h2>
            {/* Nội dung các thông báo gần đây sẽ được phát triển sau */}
            <p className="text-gray-500">Chưa có thông báo nào</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Phòng trọ phù hợp gần đây</h2>
            {/* Nội dung các phòng trọ phù hợp gần đây sẽ được phát triển sau */}
            <p className="text-gray-500">Chưa có phòng trọ phù hợp</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
