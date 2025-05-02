import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/db/pocketbase';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

// Lấy danh sách phòng đã lưu
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const pb = getPocketBase();
    const records = await pb.collection('saved_rooms').getFullList({
      filter: `user = "${session.user.id}"`,
      expand: 'room',
    });
    
    return NextResponse.json({ items: records });
  } catch (error) {
    console.error('Error fetching saved rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Lưu phòng
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { roomId, notes } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing roomId parameter' },
        { status: 400 }
      );
    }
    
    const pb = getPocketBase();
    
    // Kiểm tra xem đã lưu phòng này chưa
    const existingRecords = await pb.collection('saved_rooms').getList(1, 1, {
      filter: `user = "${session.user.id}" && room = "${roomId}"`,
    });
    
    if (existingRecords.items.length > 0) {
      // Đã lưu rồi, cập nhật notes nếu có
      if (notes !== undefined) {
        await pb.collection('saved_rooms').update(existingRecords.items[0].id, {
          notes: notes,
        });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Room already saved',
        id: existingRecords.items[0].id,
      });
    }
    
    // Lưu mới
    const record = await pb.collection('saved_rooms').create({
      user: session.user.id,
      room: roomId,
      notes: notes || '',
    });
    
    return NextResponse.json({
      success: true,
      message: 'Room saved successfully',
      id: record.id,
    });
  } catch (error) {
    console.error('Error saving room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Xóa phòng đã lưu
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { roomId } = await request.json();
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Missing roomId parameter' },
        { status: 400 }
      );
    }
    
    const pb = getPocketBase();
    
    // Tìm bản ghi cần xóa
    const records = await pb.collection('saved_rooms').getList(1, 1, {
      filter: `user = "${session.user.id}" && room = "${roomId}"`,
    });
    
    if (records.items.length === 0) {
      return NextResponse.json(
        { error: 'Room not found in saved list' },
        { status: 404 }
      );
    }
    
    // Xóa bản ghi
    await pb.collection('saved_rooms').delete(records.items[0].id);
    
    return NextResponse.json({
      success: true,
      message: 'Room removed from saved list',
    });
  } catch (error) {
    console.error('Error removing saved room:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
