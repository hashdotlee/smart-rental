'use client';

import { useState } from 'react';

interface RoomFilterProps {
  onFilter: (filters: RoomFilters) => void;
}

export interface RoomFilters {
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  district?: string;
  roomType?: string;
  utility?: string;
}

export default function RoomFilter({ onFilter }: RoomFilterProps) {
  const [filters, setFilters] = useState<RoomFilters>({});
  
  const districts = [
    'Tất cả',
    'Ba Đình',
    'Bắc Từ Liêm',
    'Cầu Giấy',
    'Đống Đa',
    'Hà Đông',
    'Hai Bà Trưng',
    'Hoàn Kiếm',
    'Hoàng Mai',
    'Long Biên',
    'Nam Từ Liêm',
    'Tây Hồ',
    'Thanh Xuân',
  ];
  
  const commonUtilities = [
    'Tất cả',
    'Điều hòa',
    'Nóng lạnh',
    'Wi-Fi',
    'Tủ lạnh',
    'Máy giặt',
    'Nhà vệ sinh riêng',
    'Bếp',
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value ? parseFloat(value) : undefined;
      setFilters(prev => ({ ...prev, [name]: numValue }));
    } else {
      if (value === 'Tất cả') {
        // Xóa filter nếu chọn "Tất cả"
        const newFilters = { ...filters };
        delete newFilters[name as keyof RoomFilters];
        setFilters(newFilters);
      } else {
        setFilters(prev => ({ ...prev, [name]: value }));
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };
  
  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Bộ lọc tìm kiếm</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Khoảng giá (VNĐ)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice || ''}
              onChange={handleChange}
              placeholder="Tối thiểu"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice || ''}
              onChange={handleChange}
              placeholder="Tối đa"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Diện tích (m²)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="minArea"
              value={filters.minArea || ''}
              onChange={handleChange}
              placeholder="Tối thiểu"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <input
              type="number"
              name="maxArea"
              value={filters.maxArea || ''}
              onChange={handleChange}
              placeholder="Tối đa"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quận/Huyện
          </label>
          <select
            name="district"
            value={filters.district || 'Tất cả'}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {districts.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại phòng
          </label>
          <select
            name="roomType"
            value={filters.roomType || 'Tất cả'}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="private">Phòng khép kín</option>
            <option value="shared">Phòng ghép</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiện ích
          </label>
          <select
            name="utility"
            value={filters.utility || 'Tất cả'}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {commonUtilities.map(util => (
              <option key={util} value={util}>
                {util}
              </option>
            ))}
          </select>
        </div>
		<div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </form>
  );
}
        
