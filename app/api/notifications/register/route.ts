import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getPocketBase } from '@/lib/db/pocketbase';

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra phiên đăng nhập
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Nhận dữ liệu đăng ký push
    const data = await request.json();
    
    if (!data.endpoint || !data.keys?.p256dh || !data.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }
    
    // Lưu đăng ký vào database
    const pb = await getPocketBase();
    
    // Kiểm tra xem đã có subscription cho user này chưa
    const existingSubscriptions = await pb.collection('push_subscriptions').getList(1, 1, {
      filter: `user = "${session.user.id}" && endpoint = "${data.endpoint}"`,
    });
    
    if (existingSubscriptions.items.length > 0) {
      // Cập nhật subscription đã tồn tại
      await pb.collection('push_subscriptions').update(existingSubscriptions.items[0].id, {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      });
    } else {
      // Tạo subscription mới
      await pb.collection('push_subscriptions').create({
        user: session.user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
