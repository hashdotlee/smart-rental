import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CriteriaForm from '../components/CriteriaForm';

export default function NewCriteriaPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Tạo tiêu chí tìm kiếm mới</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <CriteriaForm />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
