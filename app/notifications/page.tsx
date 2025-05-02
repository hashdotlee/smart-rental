'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getPocketBase } from '@/lib/db/pocketbase';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  room: string;
  type: 'email' | 'push';
  status: 'pending' | 'sent' | 'failed';
  created: string;
  sentAt?: string;
  expand?: {
    room: {
      id: string;
      title: string;
      price: number;
      area: number;
      location: string;
    };
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const pb = getPocketBase();
      const records = await pb.collection('notifications').getFullList({
        filter: `user = "${session?.user?.id}"`,
        sort: '-created',
        expand: 'room',
      });
      
      setNotifications(records);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Thông báo của bạn</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Bạn chưa có thông báo nào</p>
              <Link 
                href="/criteria/new" 
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
              >
                Tạo tiêu chí tìm kiếm
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông báo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id}>
                      <td className="px-6 py-4">
                        {notification.expand?.room ? (
                          <Link 
                            href={`/rooms/${notification.expand.room.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <span className="font-medium">{notification.expand.room.title}</span>
                            <p className="text-sm text-gray-500">
                              {notification.expand.room.price.toLocaleString('vi-VN')}đ/tháng - {notification.expand.room.area}m²
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {notification.expand.room.location}
                            </p>
                          </Link>
                        ) : (
                          <span className="text-gray-500">Phòng không còn tồn tại</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(notification.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {notification.type === 'email' ? 'Email' : 'Push'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          notification.status === 'sent' ? 'bg-green-100 text-green-800' : 
                          notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {notification.status === 'sent' ? 'Đã gửi' : 
                           notification.status === 'pending' ? 'Đang chờ' : 
                           'Lỗi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
