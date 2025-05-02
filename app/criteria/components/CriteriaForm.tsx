'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getPocketBase } from '@/lib/db/pocketbase';
import toast from 'react-hot-toast';

interface CriteriaFormProps {
  criteriaId?: string;
}

interface Criteria {
  id?: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  utilities: string[];
  roomType: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  active: boolean;
}

const defaultCriteria: Criteria = {
  location: 'Hà Nội',
  minPrice: 2000000,
  maxPrice: 5000000,
  minArea: 20,
  maxArea: 35,
  utilities: ['Điều hòa', 'Nóng lạnh', 'Wi-Fi'],
  roomType: 'private',
  notifyEmail: true,
  notifyPush: false,
  active: true,
};

const commonUtilities = [
  'Điều hòa', 
  'Nóng lạnh', 
  'Wi-Fi', 
  'Tủ lạnh', 
  'Máy giặt', 
  'Giường', 
  'Tủ quần áo', 
  'Bàn ghế', 
  'Nhà vệ sinh riêng', 
  'Bếp',
];

export default function CriteriaForm({ criteriaId }: CriteriaFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState<Criteria>(defaultCriteria);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [utility, setUtility] = useState('');
  
  // Lấy dữ liệu tiêu chí nếu đang chỉnh sửa
  useEffect(() => {
    const fetchCriteria = async () => {
      if (!criteriaId) return;
      
      try {
        setIsEditing(true);
        setLoading(true);
        
        const pb = getPocketBase();
        const record = await pb.collection('room_criteria').getOne(criteriaId);
        
        setFormData({
          location: record.location,
          minPrice: record.minPrice,
          maxPrice: record.maxPrice,
          minArea: record.minArea,
          maxArea: record.maxArea,
          utilities: record.utilities || [],
          roomType: record.roomType,
          notifyEmail: record.notifyEmail,
          notifyPush: record.notifyPush,
          active: record.active,
        });
      } catch (error) {
        console.error('Error fetching criteria:', error);
        toast.error('Không thể tải thông tin tiêu chí');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCriteria();
  }, [criteriaId, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    if (isCheckbox) {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };
  
  const handleUtilityToggle = (util: string) => {
    setFormData(prev => {
      const utilities = prev.utilities || [];
      if (utilities.includes(util)) {
        return { ...prev, utilities: utilities.filter(u => u !== util) };
      } else {
        return { ...prev, utilities: [...utilities, util] };
      }
    });
  };
  
  const addCustomUtility = () => {
    if (!utility.trim()) return;
    
    setFormData(prev => {
      const utilities = prev.utilities || [];
      if (!utilities.includes(utility)) {
        return { ...prev, utilities: [...utilities, utility] };
      }
      return prev;
    });
    
    setUtility('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id) {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      return;
    }
    
    try {
      setLoading(true);
      const pb = getPocketBase();
      
      const data = {
        ...formData,
        user: session.user.id,
      };
      
      if (isEditing) {
        await pb.collection('room_criteria').update(criteriaId as string, data);
        toast.success('Cập nhật tiêu chí thành công');
      } else {
        await pb.collection('room_criteria').create(data);
        toast.success('Tạo tiêu chí thành công');
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving criteria:', error);
      toast.error('Không thể lưu tiêu chí');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditing) {
    return <div className="text-center py-8">Đang tải...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Khu vực
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Ví dụ: Cầu Giấy, Hà Nội"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giá tối thiểu (VNĐ)
          </label>
          <input
            type="number"
            name="minPrice"
            value={formData.minPrice}
            onChange={handleChange}
            required
            min="0"
            step="100000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Giá tối đa (VNĐ)
          </label>
          <input
            type="number"
            name="maxPrice"
            value={formData.maxPrice}
            onChange={handleChange}
            required
            min={formData.minPrice}
            step="100000"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diện tích tối thiểu (m²)
          </label>
          <input
            type="number"
            name="minArea"
            value={formData.minArea}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diện tích tối đa (m²)
          </label>
          <input
            type="number"
            name="maxArea"
            value={formData.maxArea}
            onChange={handleChange}
            required
            min={formData.minArea}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại phòng
        </label>
        <select
          name="roomType"
          value={formData.roomType}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="private">Phòng khép kín</option>
          <option value="shared">Phòng ghép</option>
          <option value="any">Tất cả</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tiện ích
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
          {commonUtilities.map(util => (
            <div key={util} className="flex items-center">
              <input
                type="checkbox"
                id={`util-${util}`}
                checked={formData.utilities?.includes(util) || false}
                onChange={() => handleUtilityToggle(util)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor={`util-${util}`} className="ml-2 text-sm text-gray-700">
                {util}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex mt-2">
          <input
            type="text"
            value={utility}
            onChange={(e) => setUtility(e.target.value)}
            placeholder="Tiện ích khác"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={addCustomUtility}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Thêm
          </button>
        </div>
        
        {formData.utilities && formData.utilities.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-1">Tiện ích đã chọn:</p>
            <div className="flex flex-wrap gap-2">
              {formData.utilities.map(util => (
                <span 
                  key={util} 
                  className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {util}
                  <button
                    type="button"
                    onClick={() => handleUtilityToggle(util)}
                    className="ml-1 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thông báo
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyEmail"
              name="notifyEmail"
              checked={formData.notifyEmail}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="notifyEmail" className="ml-2 text-sm text-gray-700">
              Gửi thông báo qua email
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="notifyPush"
              name="notifyPush"
              checked={formData.notifyPush}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="notifyPush" className="ml-2 text-sm text-gray-700">
              Gửi thông báo đẩy trên trình duyệt
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="active"
          name="active"
          checked={formData.active}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 text-sm text-gray-700">
          Kích hoạt tiêu chí này
        </label>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}
