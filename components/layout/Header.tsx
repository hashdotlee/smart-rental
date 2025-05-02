'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import React from 'react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Tìm Phòng Trọ
        </Link>
        
        <nav className="space-x-4">
          <Link 
            href="/" 
            className="hover:text-indigo-200 transition"
          >
            Trang chủ
          </Link>
          <Link 
            href="/rooms" 
            className="hover:text-indigo-200 transition"
          >
            Phòng trọ
          </Link>
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className="hover:text-indigo-200 transition"
              >
                Tiêu chí tìm kiếm
              </Link>
              <button
                onClick={() => signOut()}
                className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800 transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800 transition"
            >
              Đăng nhập
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
