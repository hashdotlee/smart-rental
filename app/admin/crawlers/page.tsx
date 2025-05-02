'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPocketBase } from '@/lib/db/pocketbase';
import toast from 'react-hot-toast';

interface CrawlJob {
  id: string;
  sourceType: 'chotot' | 'facebook';
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun: string;
  roomsFound: number;
  error: string;
  created: string;
}

interface FacebookGroup {
  id: string;
  groupId: string;
  name: string;
  url: string;
  lastCrawled: string;
  enabled: boolean;
}

export default function AdminCrawlersPage() {
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [facebookGroups, setFacebookGroups] = useState<FacebookGroup[]>([]);
  const [newGroupId, setNewGroupId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupUrl, setNewGroupUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (!session) {
      return;
    }
    
    fetchData();
  }, [session]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const pb = getPocketBase();
      
      // Lấy danh sách jobs
      const jobsList = await pb.collection('crawl_jobs').getFullList({
        sort: '-created',
      });
      
      setJobs(jobsList);
      
      // Lấy danh sách nhóm Facebook
      const groupsList = await pb.collection('fb_groups').getFullList({
        sort: 'name',
      });
      
      setFacebookGroups(groupsList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  
  const runChoTotCrawler = async () => {
    try {
      const response = await fetch('/api/crawlers/chotot', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to start ChoTot crawler');
      }
      
      toast.success('Đã bắt đầu thu thập dữ liệu từ Chợ Tốt');
      
      // Cập nhật lại danh sách sau 1 giây
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      console.error('Error running ChoTot crawler:', error);
      toast.error('Không thể chạy crawler Chợ Tốt');
    }
  };
  
  const runFacebookCrawler = async () => {
    if (!session?.user?.id) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }
    
    try {
      const response = await fetch('/api/crawlers/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: session.user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start Facebook crawler');
      }
      
      toast.success('Đã bắt đầu thu thập dữ liệu từ Facebook');
      
      // Cập nhật lại danh sách sau 1 giây
      setTimeout(() => fetchData(), 1000);
    } catch (error) {
      console.error('Error running Facebook crawler:', error);
      toast.error('Không thể chạy crawler Facebook');
    }
  };
  
  const addFacebookGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGroupId || !newGroupName || !newGroupUrl) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    try {
      const pb = getPocketBase();
      
      // Kiểm tra trùng lặp
      const existingGroups = await pb.collection('fb_groups').getList(1, 1, {
        filter: `groupId = "${newGroupId}"`,
      });
      
      if (existingGroups.items.length > 0) {
        toast.error('Nhóm Facebook này đã tồn tại');
        return;
      }
      
      // Thêm nhóm mới
      await pb.collection('fb_groups').create({
        groupId: newGroupId,
        name: newGroupName,
        url: newGroupUrl,
        enabled: true,
      });
      
      toast.success('Đã thêm nhóm Facebook mới');
      
      // Reset form
      setNewGroupId('');
      setNewGroupName('');
      setNewGroupUrl('');
      
      // Cập nhật lại danh sách
      fetchData();
    } catch (error) {
      console.error('Error adding Facebook group:', error);
      toast.error('Không thể thêm nhóm Facebook');
    }
  };
  
  const toggleGroupStatus = async (id: string, enabled: boolean) => {
    try {
      const pb = getPocketBase();
      
      // Cập nhật trạng thái
      await pb.collection('fb_groups').update(id, {
        enabled: !enabled,
      });
      
      toast.success(`Đã ${!enabled ? 'bật' : 'tắt'} nhóm`);
      
      // Cập nhật lại danh sách
      fetchData();
    } catch (error) {
      console.error('Error toggling group status:', error);
      toast.error('Không thể cập nhật trạng thái nhóm');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Quản lý Thu Thập Dữ Liệu</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phần Chợ Tốt */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Crawler Chợ Tốt</h2>
                <button
                  onClick={runChoTotCrawler}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                  Chạy ngay
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kết quả
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs
                      .filter(job => job.sourceType === 'chotot')
                      .slice(0, 5)
                      .map((job) => (
                        <tr key={job.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(job.created)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job.status === 'completed' ? 'Hoàn thành' :
                               job.status === 'running' ? 'Đang chạy' :
                               job.status === 'failed' ? 'Lỗi' :
                               'Đang chờ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {job.status === 'completed' ? `${job.roomsFound} phòng` :
                             job.status === 'failed' ? `Lỗi: ${job.error || 'Không xác định'}` :
                             '-'}
                          </td>
                        </tr>
                      ))}
                    
                    {jobs.filter(job => job.sourceType === 'chotot').length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500">
                          Chưa có lịch sử chạy crawler
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Phần Facebook */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Crawler Facebook</h2>
                <button
                  onClick={runFacebookCrawler}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                  Chạy ngay
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kết quả
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs
                      .filter(job => job.sourceType === 'facebook')
                      .slice(0, 5)
                      .map((job) => (
                        <tr key={job.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(job.created)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              job.status === 'completed' ? 'bg-green-100 text-green-800' :
                              job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                              job.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job.status === 'completed' ? 'Hoàn thành' :
                               job.status === 'running' ? 'Đang chạy' :
                               job.status === 'failed' ? 'Lỗi' :
                               'Đang chờ'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {job.status === 'completed' ? `${job.roomsFound} phòng` :
                             job.status === 'failed' ? `Lỗi: ${job.error || 'Không xác định'}` :
                             '-'}
                          </td>
                        </tr>
                      ))}
                    
                    {jobs.filter(job => job.sourceType === 'facebook').length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500">
                          Chưa có lịch sử chạy crawler
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Danh sách nhóm Facebook */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Quản lý Nhóm Facebook</h2>
              
              <form onSubmit={addFacebookGroup} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Nhóm
                  </label>
                  <input
                    type="text"
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="123456789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Nhóm
                  </label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Nhóm Phòng Trọ Hà Nội"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                  >
                    Thêm nhóm
                  </button>
                </div>
              </form>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên nhóm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID nhóm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lần thu thập cuối
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facebookGroups.map((group) => (
                      <tr key={group.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {group.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {group.groupId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {group.lastCrawled ? formatDate(group.lastCrawled) : 'Chưa thu thập'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            group.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {group.enabled ? 'Đang hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleGroupStatus(group.id, group.enabled)}
                            className={`mr-2 ${
                              group.enabled ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {group.enabled ? 'Tạm dừng' : 'Kích hoạt'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {facebookGroups.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-sm text-gray-500">
                          Chưa có nhóm Facebook nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
