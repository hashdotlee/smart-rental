import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Tìm Phòng Trọ</h3>
            <p className="mb-4">
              Ứng dụng tìm kiếm phòng trọ thông minh tại Hà Nội sử dụng AI để đánh giá và gợi ý phòng phù hợp.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-300 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-indigo-300 transition">
                  Phòng trọ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-300 transition">
                  Tiêu chí tìm kiếm
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
            <p className="mb-2">Email: contact@timphongtro.com</p>
            <p>Điện thoại: (024) 1234 5678</p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center">
          <p>&copy; {new Date().getFullYear()} - Tìm Phòng Trọ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
