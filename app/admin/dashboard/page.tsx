'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra quyền admin
    if (status === 'authenticated') {
      if (!session.user.isAdmin) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, session, router]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold">Quản trị viên</span>
            <div className="ml-10 space-x-4">
              <Link 
                href="/admin/dashboard" 
                className="hover:text-indigo-200 transition font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/crawlers" 
                className="hover:text-indigo-200 transition"
              >
                Crawlers
              </Link>
              <Link 
                href="/admin/users" 
                className="hover:text-indigo-200 transition"
              >
                Người dùng
              </Link>
              <Link 
                href="/admin/rooms" 
                className="hover:text-indigo-200 transition"
              >
                Phòng trọ
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800 transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Bảng điều khiển</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Người dùng</h2>
              <p className="text-3xl font-bold">0</p>
              <Link 
                href="/admin/users" 
                className="mt-4 inline-block text-sm text-blue-200 hover:text-white transition"
              >
                Xem chi tiết →
              </Link>
            </div>
            
            <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Phòng trọ</h2>
              <p className="text-3xl font-bold">0</p>
              <Link 
                href="/admin/rooms" 
                className="mt-4 inline-block text-sm text-green-200 hover:text-white transition"
              >
                Xem chi tiết →
              </Link>
            </div>
            
            <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-2">Tiêu chí tìm kiếm</h2>
              <p className="text-3xl font-bold">0</p>
              <Link 
                href="/admin/criteria" 
                className="mt-4 inline-block text-sm text-purple-200 hover:text-white transition"
              >
                Xem chi tiết →
              </Link>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/admin/crawlers" 
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition text-center"
              >
                Quản lý thu thập dữ liệu
              </Link>
              
              <Link 
                href="/admin/notifications" 
                className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-center"
              >
                Quản lý thông báo
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
