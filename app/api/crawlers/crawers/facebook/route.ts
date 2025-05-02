import { NextRequest, NextResponse } from 'next/server';
import { FacebookCrawler } from '@/lib/crawlers/facebook/FacebookCrawler';
import { getPocketBase } from '@/lib/db/pocketbase';
import { getServerSession } from 'next-auth';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Kiểm tra xem người dùng có quyền admin không
    // Lưu ý: Bạn cần tự triển khai kiểm tra quyền phù hợp
    
    // Lấy Facebook access token để chạy crawler
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // Lấy token từ database
    const pb = getPocketBase();
    const fbAccounts = await pb.collection('fb_accounts').getList(1, 1, {
      filter: `user = "${userId}"`,
    });
    
    if (fbAccounts.items.length === 0) {
      return NextResponse.json(
        { error: 'No Facebook account found for this user' },
        { status: 400 }
      );
    }
    
    const accessToken = fbAccounts.items[0].accessToken;
    
    // Tạo và chạy crawler
    const crawler = new FacebookCrawler(accessToken);
    
    // Chạy crawler không đồng bộ để không chặn request
    crawler.run().catch(error => {
      console.error('Error running Facebook crawler:', error);
    });
    
    return NextResponse.json({
      success: true,
      message: 'Started Facebook crawler task'
    });
  } catch (error) {
    console.error('Error starting Facebook crawler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
