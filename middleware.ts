import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const isLoginPage = nextUrl.pathname.startsWith('/login');
  const isProtectedPage = 
    nextUrl.pathname.startsWith('/dashboard') || 
    nextUrl.pathname.startsWith('/criteria');
  
  // Nếu đã đăng nhập và truy cập trang login, chuyển hướng về dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
  
  // Nếu chưa đăng nhập và truy cập trang protected, chuyển hướng về login
  if (!isLoggedIn && isProtectedPage) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', encodeURI(nextUrl.href));
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
});

// Chỉ định các route áp dụng middleware
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/criteria/:path*', 
    '/login'
  ],
};
