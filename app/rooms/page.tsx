'use client';

import { useEffect, useState } from 'react';
import { getPocketBase } from '@/lib/db/pocketbase';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import RoomCard from './components/RoomCard';
import RoomFilter, { RoomFilters } from './components/RoomFilter';
import toast from 'react-hot-toast';

interface Room {
  id: string;
  title: string;
  price: number;
  area: number;
  location: string;
  district: string;
  utilities: string[];
  roomType: string;
  photos: string[];
  aiScore?: number;
  sourceUrl: string;
  sourceType: string;
  available: boolean;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RoomFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);
  const roomsPerPage = 12;
  
  useEffect(() => {
    fetchRooms();
  }, [filters, currentPage]);
  
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      const pb = getPocketBase();
      
      // Xây dựng filter query
      let filterQueries = ['available = true'];
      
      if (filters.minPrice) {
        filterQueries.push(`price >= ${filters.minPrice}`);
      }
      
      if (filters.maxPrice) {
        filterQueries.push(`price <= ${filters.maxPrice}`);
      }
      
      if (filters.minArea) {
        filterQueries.push(`area >= ${filters.minArea}`);
      }
      
      if (filters.maxArea) {
        filterQueries.push(`area <= ${filters.maxArea}`);
      }
      
      if (filters.district && filters.district !== 'Tất cả') {
        filterQueries.push(`district = "${filters.district}"`);
      }
      
      if (filters.roomType && filters.roomType !== 'Tất cả') {
        filterQueries.push(`roomType = "${filters.roomType}"`);
      }
      
      if (filters.utility && filters.utility !== 'Tất cả') {
        filterQueries.push(`utilities ~ "${filters.utility}"`);
      }
      
      const filterQuery = filterQueries.join(' && ');
      
      // Fetch rooms with pagination
      const resultList = await pb.collection('rental_rooms').getList(currentPage, roomsPerPage, {
        filter: filterQuery,
        sort: '-created',
      });
      
      setRooms(resultList.items);
      setTotalPages(Math.ceil(resultList.totalItems / roomsPerPage));
      setTotalRooms(resultList.totalItems);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Không thể tải danh sách phòng trọ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: RoomFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset về trang đầu tiên khi filter thay đổi
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageButtons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Nút Previous
    pageButtons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &laquo;
      </button>
    );
    
    // First page
    if (startPage > 1) {
      pageButtons.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === 1
              ? 'bg-indigo-600 text-white'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        pageButtons.push(
          <span key="dots1" className="px-2">
            ...
          </span>
        );
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue;
      
      pageButtons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="dots2" className="px-2">
            ...
          </span>
        );
      }
      
      pageButtons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded-md border ${
            currentPage === totalPages
              ? 'bg-indigo-600 text-white'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Nút Next
    pageButtons.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &raquo;
      </button>
    );
    
    return (
      <div className="flex justify-center mt-6 space-x-1">
        {pageButtons}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Danh sách phòng trọ</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <RoomFilter onFilter={handleFilterChange} />
          </div>
          
          <div className="md:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 mb-2">Không tìm thấy phòng trọ phù hợp</p>
                <p className="text-sm text-gray-500">Vui lòng thử lại với bộ lọc khác</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    Tìm thấy {totalRooms} phòng trọ phù hợp
                  </p>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    // Chức năng sắp xếp sẽ được phát triển sau
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="price_asc">Giá thấp đến cao</option>
                    <option value="price_desc">Giá cao đến thấp</option>
                    <option value="area_asc">Diện tích nhỏ đến lớn</option>
                    <option value="area_desc">Diện tích lớn đến nhỏ</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
                
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
