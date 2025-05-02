import { NextRequest, NextResponse } from 'next/server';
import { ChoTotCrawler } from '@/lib/crawlers/chotot/ChoTotCrawler';
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
    
    // Tạo và chạy crawler
    const crawler = new ChoTotCrawler();
    
    // Chạy crawler không đồng bộ để không chặn request
    crawler.run().catch(error => {
      console.error('Error running ChoTot crawler:', error);
    });
    
    return NextResponse.json({
      success: true,
      message: 'Started ChoTot crawler task'
    });
  } catch (error) {
    console.error('Error starting ChoTot crawler:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
