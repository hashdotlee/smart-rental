'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { HiOutlineBookmark, HiBookmark } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface SaveRoomButtonProps {
  roomId: string;
}

export default function SaveRoomButton({ roomId }: SaveRoomButtonProps) {
  const { data: session, status } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (status === 'authenticated') {
      checkIfSaved();
    }
  }, [status, roomId]);
  
  const checkIfSaved = async () => {
    try {
      const response = await fetch('/api/saved-rooms');
      if (!response.ok) throw new Error('Failed to fetch saved rooms');
      
      const data = await response.json();
      const saved = data.items.some((item: any) => item.room === roomId);
      
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if room is saved:', error);
    }
  };
  
  const handleToggleSave = async () => {
    if (status !== 'authenticated') {
      toast.error('Vui lòng đăng nhập để lưu phòng');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isSaved) {
        // Xóa khỏi danh sách đã lưu
        const response = await fetch('/api/saved-rooms', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomId }),
        });
        
        if (!response.ok) throw new Error('Failed to remove room from saved list');
        
        setIsSaved(false);
        toast.success('Đã xóa phòng khỏi danh sách yêu thích');
      } else {
        // Thêm vào danh sách đã lưu
        const response = await fetch('/api/saved-rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ roomId }),
        });
        
        if (!response.ok) throw new Error('Failed to save room');
        
        setIsSaved(true);
        toast.success('Đã lưu phòng vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error toggling save room:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };
  
  if (status === 'loading') {
    return null;
  }
  
  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
        isSaved
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } transition-colors disabled:opacity-50`}
      title={isSaved ? 'Đã lưu' : 'Lưu phòng này'}
    >
      {isSaved ? (
        <>
          <HiBookmark className="text-yellow-600" />
          <span>Đã lưu</span>
        </>
      ) : (
        <>
          <HiOutlineBookmark />
          <span>Lưu phòng</span>
        </>
      )}
    </button>
  );
}
