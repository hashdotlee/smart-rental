import { NextResponse } from 'next/server';
import { auth } from './auth';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Các trang cần đăng nhập
  const isProtected = 
    path.startsWith('/dashboard') || 
    path.startsWith('/criteria');
  
  // Các trang admin
  const isAdminPage = path.startsWith('/admin') && !path.startsWith('/admin/login');
  
  // Lấy thông tin phiên từ NextAuth
  const session = await auth();
  
  // Chuyển hướng tới trang đăng nhập admin nếu
  // - là trang admin
  // - và chưa đăng nhập hoặc không phải admin
  if (isAdminPage && (!session || !session.user.isAdmin)) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Chuyển hướng tới trang đăng nhập thông thường nếu
  // - là trang được bảo vệ (không phải admin)
  // - và chưa đăng nhập
  if (isProtected && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Nếu đã đăng nhập mà vào trang login
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Nếu đã đăng nhập là admin mà vào trang admin login
  if (path === '/admin/login' && session && session.user.isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Cấu hình các đường dẫn cần kiểm tra middleware
export const config = {
  matcher: ['/dashboard/:path*', '/criteria/:path*', '/login', '/admin/:path*'],
};
