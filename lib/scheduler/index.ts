import cron from 'node-cron';
import { ChoTotCrawler } from '@/lib/crawlers/chotot/ChoTotCrawler';
import { FacebookCrawler } from '@/lib/crawlers/facebook/FacebookCrawler';
import { getPocketBase } from '@/lib/db/pocketbase';
import { processNotifications } from '@/lib/notifications/processor';

let isSchedulerInitialized = false;

/**
 * Khởi tạo các scheduled jobs
 */
export function initializeScheduler() {
  if (isSchedulerInitialized) {
    return;
  }
  
  console.log('Initializing scheduler...');
  
  // Cập nhật trạng thái phòng (đánh dấu phòng không còn tồn tại)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running room status update job...');
    await updateRoomStatus();
  });
  
  // Chạy crawler ChợTốt mỗi 6 giờ
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running ChoTot crawler...');
    const crawler = new ChoTotCrawler();
    await crawler.run();
  });
  
  // Chạy job xử lý thông báo mỗi 30 phút
  cron.schedule('*/30 * * * *', async () => {
    console.log('Processing notifications...');
    await processNotifications();
  });
  
  // Chạy crawler Facebook cho từng tài khoản đã đăng ký
  cron.schedule('0 */12 * * *', async () => {
    console.log('Running Facebook crawlers...');
    await runFacebookCrawlers();
  });
  
  isSchedulerInitialized = true;
  console.log('Scheduler initialized');
}

/**
 * Cập nhật trạng thái phòng (đánh dấu phòng không còn tồn tại)
 */
async function updateRoomStatus() {
  try {
    const pb = getPocketBase();
    
    // Lấy thời gian hiện tại
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Tìm các phòng đã không được cập nhật trong 30 ngày
    const outdatedRooms = await pb.collection('rental_rooms').getFullList({
      filter: `lastSeen < "${thirtyDaysAgo.toISOString()}" && available = true`,
    });
    
    console.log(`Found ${outdatedRooms.length} outdated rooms`);
    
    // Cập nhật từng phòng
    for (const room of outdatedRooms) {
      await pb.collection('rental_rooms').update(room.id, {
        available: false,
      });
    }
    
    console.log(`Updated ${outdatedRooms.length} rooms to unavailable`);
  } catch (error) {
    console.error('Error updating room status:', error);
  }
}

/**
 * Chạy crawler Facebook cho từng tài khoản đã đăng ký
 */
async function runFacebookCrawlers() {
  try {
    const pb = getPocketBase();
    
    // Lấy danh sách tài khoản Facebook có token hợp lệ
    const now = new Date();
    const fbAccounts = await pb.collection('fb_accounts').getFullList({
      filter: `expiresAt > "${now.toISOString()}"`,
    });
    
    console.log(`Found ${fbAccounts.length} valid Facebook accounts`);
    
    // Chạy crawler cho từng tài khoản
    for (const account of fbAccounts) {
      try {
        const crawler = new FacebookCrawler(account.accessToken);
        await crawler.run();
      } catch (error) {
        console.error(`Error running Facebook crawler for account ${account.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error running Facebook crawlers:', error);
  }
}
