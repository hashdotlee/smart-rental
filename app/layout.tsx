import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/context/AuthProvider';
import { Toaster } from 'react-hot-toast';
import { initServer } from '@/lib/server-init';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Khởi tạo server
initServer();

export const metadata: Metadata = {
  title: 'Tìm Phòng Trọ Thông Minh',
  description: 'Ứng dụng tìm kiếm phòng trọ tại Hà Nội sử dụng AI',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
		<Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
          {children}
		  </Suspense>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
