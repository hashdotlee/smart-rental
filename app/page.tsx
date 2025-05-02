import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-indigo-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Tìm phòng trọ thông minh tại Hà Nội
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Ứng dụng sử dụng AI để tìm kiếm và đánh giá phòng trọ từ nhiều nguồn, giúp bạn tìm được nơi ở phù hợp.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/rooms" 
                className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-100 transition"
              >
                Xem phòng trọ
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg border border-white hover:bg-indigo-800 transition"
              >
                Đặt tiêu chí tìm kiếm
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Tính năng nổi bật</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-indigo-600 text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Thu thập thông tin đa nguồn</h3>
                <p className="text-gray-600">
                  Tự động thu thập dữ liệu từ Chợ Tốt và các nhóm Facebook về phòng trọ tại Hà Nội.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-indigo-600 text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">Đánh giá bằng AI</h3>
                <p className="text-gray-600">
                  Sử dụng trí tuệ nhân tạo để phân tích và đánh giá chất lượng phòng trọ theo nhiều tiêu chí.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-indigo-600 text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold mb-2">Thông báo thông minh</h3>
                <p className="text-gray-600">
                  Nhận thông báo ngay khi có phòng trọ mới phù hợp với tiêu chí bạn đặt ra.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-indigo-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Bắt đầu tìm phòng ngay hôm nay</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Đăng ký và thiết lập tiêu chí để nhận thông báo về các phòng trọ phù hợp.
            </p>
            <Link 
              href="/login" 
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition"
            >
              Đăng ký ngay
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
