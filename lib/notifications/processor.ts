import { getPocketBase } from '@/lib/db/pocketbase';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import { createRoomNotificationEmail } from './email-templates';

/**
 * Xử lý các thông báo đang chờ
 */
export async function processNotifications() {
  try {
    const pb = getPocketBase();
    
    // Lấy danh sách thông báo đang chờ
    const pendingNotifications = await pb.collection('notifications').getFullList({
      filter: 'status = "pending"',
      expand: 'user,room,criteria',
    });
    
    console.log(`Processing ${pendingNotifications.length} pending notifications`);
    
    // Xử lý từng thông báo
    for (const notification of pendingNotifications) {
      try {
        if (notification.type === 'email') {
          await sendEmailNotification(notification);
        } else if (notification.type === 'push') {
          await sendPushNotification(notification);
        }
        
        // Cập nhật trạng thái thông báo
        await pb.collection('notifications').update(notification.id, {
          status: 'sent',
          sentAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
        
        // Cập nhật trạng thái lỗi
        await pb.collection('notifications').update(notification.id, {
          status: 'failed',
          error: (error as Error).message,
        });
      }
    }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
}

/**
 * Gửi thông báo qua email
 */
async function sendEmailNotification(notification: any) {
  // Kiểm tra thông tin mở rộng
  if (!notification.expand?.user || !notification.expand?.room || !notification.expand?.criteria) {
    throw new Error('Missing expanded data for notification');
  }
  
  const user = notification.expand.user;
  const room = notification.expand.room;
  
  // Tạo transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
  
  // Tạo nội dung email
  const emailHtml = createRoomNotificationEmail({
    userName: user.name || 'Bạn',
    roomTitle: room.title,
    roomPrice: room.price,
    roomArea: room.area,
    roomLocation: room.location,
    roomId: room.id,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });
  
  // Gửi email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@timphongtro.com',
    to: user.email,
    subject: 'Thông Báo Phòng Trọ Mới',
    html: emailHtml,
  });
  
  console.log(`Sent email notification to ${user.email}`);
}

/**
 * Gửi thông báo đẩy
 */
async function sendPushNotification(notification: any) {
  // Kiểm tra thông tin mở rộng
  if (!notification.expand?.user || !notification.expand?.room || !notification.expand?.criteria) {
    throw new Error('Missing expanded data for notification');
  }
  
  const user = notification.expand.user;
  const room = notification.expand.room;
  
  // Thiết lập Web Push
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:info@timphongtro.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || '',
  );
  
  // Lấy subscription của người dùng
  const pb = getPocketBase();
  const pushSubscriptions = await pb.collection('push_subscriptions').getFullList({
    filter: `user = "${user.id}"`,
  });
  
  if (pushSubscriptions.length === 0) {
    throw new Error('No push subscription found for user');
  }
  
  // Chuẩn bị dữ liệu thông báo
  const notificationPayload = {
    title: 'Tìm thấy phòng trọ mới',
    body: `${room.title} - ${room.price.toLocaleString('vi-VN')}đ/tháng`,
    icon: '/images/logo.png',
    badge: '/images/badge.png',
    url: `/rooms/${room.id}`,
  };
  
  // Gửi thông báo đến tất cả subscription của người dùng
  for (const subscription of pushSubscriptions) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      };
      
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(notificationPayload)
      );
      
      console.log(`Sent push notification to ${user.email}`);
    } catch (error) {
      console.error(`Error sending push notification to subscription ${subscription.id}:`, error);
      
      // Nếu subscription không hợp lệ, xóa nó
      if ((error as any).statusCode === 410) {
        await pb.collection('push_subscriptions').delete(subscription.id);
        console.log(`Deleted invalid push subscription ${subscription.id}`);
      }
    }
  }
}
