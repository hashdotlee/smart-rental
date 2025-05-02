import axios from 'axios';
import { getPocketBase } from '@/lib/db/pocketbase';
import { analyzeRoomData } from '@/lib/ai/analyzer';
import { extractLocationInfo } from '@/lib/utils/location';

interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  attachments?: {
    data: Array<{
      media: {
        image: {
          src: string;
        };
      };
    }>;
  };
}

interface FacebookRoom {
  title: string;
  description: string;
  price: number;
  area: number;
  location: string;
  photos: string[];
  sourceUrl: string;
  sourceType: 'facebook';
  rawData: any;
}

export class FacebookCrawler {
  private accessToken: string;
  private maxPosts = 50;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
  
  /**
   * Lấy danh sách các nhóm Facebook được kích hoạt
   */
  private async getEnabledGroups(): Promise<any[]> {
    try {
      const pb = getPocketBase();
      const groups = await pb.collection('fb_groups').getFullList({
        filter: 'enabled = true',
      });
      
      return groups;
    } catch (error) {
      console.error('Error fetching enabled Facebook groups:', error);
      return [];
    }
  }
  
  /**
   * Lấy bài viết từ một nhóm Facebook
   */
  private async getGroupPosts(groupId: string): Promise<FacebookPost[]> {
    try {
      const url = `https://graph.facebook.com/v18.0/${groupId}/feed`;
      const params = {
        access_token: this.accessToken,
        limit: this.maxPosts,
        fields: 'id,message,created_time,permalink_url,attachments{media}'
      };
      
      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching posts from group ${groupId}:`, error);
      return [];
    }
  }
  
  /**
   * Phân tích bài đăng Facebook để trích xuất thông tin phòng trọ
   */
  private async parseRoomPost(post: FacebookPost): Promise<FacebookRoom | null> {
    if (!post.message || post.message.length < 50) {
      return null; // Bỏ qua bài viết không có nội dung đủ dài
    }
    
    // Trích xuất thông tin cơ bản từ bài đăng
    const title = post.message.split('\n')[0].substring(0, 100);
    const description = post.message;
    
    // Trích xuất giá
    const priceMatch = post.message.match(/(\d+(\.\d+)?)(\s*tr(iệu)?|\s*triệu|\s*k|\s*đ|\s*vnd|đồng)/i);
    let price = 0;
    
    if (priceMatch) {
      const priceValue = parseFloat(priceMatch[1]);
      const priceUnit = priceMatch[3].trim().toLowerCase();
      
      if (priceUnit.includes('tr') || priceUnit.includes('triệu')) {
        price = priceValue * 1000000;
      } else if (priceUnit.includes('k')) {
        price = priceValue * 1000;
      } else {
        price = priceValue;
      }
    }
    
    // Trích xuất diện tích
    const areaMatch = post.message.match(/(\d+(\.\d+)?)\s*(m2|m²)/i);
    let area = 0;
    
    if (areaMatch) {
      area = parseFloat(areaMatch[1]);
    }
    
    // Trích xuất địa điểm
    let location = 'Hà Nội';
    
    // Tìm kiếm địa chỉ có chứa tên quận/huyện của Hà Nội
    const districts = [
      'Ba Đình', 'Bắc Từ Liêm', 'Cầu Giấy', 'Đống Đa', 'Hà Đông',
      'Hai Bà Trưng', 'Hoàn Kiếm', 'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm',
      'Tây Hồ', 'Thanh Xuân'
    ];
    
    for (const district of districts) {
      if (post.message.includes(district)) {
        location = `${district}, Hà Nội`;
        break;
      }
    }
    
    // Trích xuất ảnh
    const photos: string[] = [];
    
    if (post.attachments && post.attachments.data) {
      post.attachments.data.forEach(attachment => {
        if (attachment.media && attachment.media.image) {
          photos.push(attachment.media.image.src);
        }
      });
    }
    
    // Kiểm tra xem có đủ thông tin để tạo bản ghi phòng trọ không
    if (title && description && price > 0 && area > 0) {
      return {
        title,
        description,
        price,
        area,
        location,
        photos,
        sourceUrl: post.permalink_url,
        sourceType: 'facebook',
        rawData: {
          title,
          price: `${price}`,
          area: `${area}`,
          location,
          description
        }
      };
    }
    
    return null;
  }
  
  /**
   * Lưu thông tin phòng vào database
   */
  private async saveRoomData(room: FacebookRoom): Promise<void> {
    try {
      const pb = getPocketBase();
      
      // Kiểm tra xem phòng đã tồn tại chưa
      const existingRooms = await pb.collection('rental_rooms').getList(1, 1, {
        filter: `sourceUrl = "${room.sourceUrl}"`,
      });
      
      // Trích xuất thông tin địa điểm
      const { district } = extractLocationInfo(room.location);
      
      // Phân tích dữ liệu bằng AI
      const aiAnalysis = await analyzeRoomData({
        title: room.title,
        description: room.description,
        price: room.price,
        area: room.area,
        location: room.location,
        rawData: room.rawData
      });
      
      const roomData = {
        title: room.title,
        description: room.description,
        price: room.price,
        area: room.area,
        location: room.location,
        district: district || '',
        utilities: aiAnalysis.tien_ich || [],
        roomType: aiAnalysis.loai_phong || 'private',
        photos: room.photos,
        sourceUrl: room.sourceUrl,
        sourceType: room.sourceType,
        aiScore: aiAnalysis.diem || null,
        aiAnalysis: aiAnalysis,
        available: true,
        lastSeen: new Date().toISOString(),
      };
      
      if (existingRooms.items.length > 0) {
        // Cập nhật phòng đã tồn tại
        await pb.collection('rental_rooms').update(existingRooms.items[0].id, roomData);
        console.log(`Updated room from Facebook: ${room.title}`);
      } else {
        // Tạo phòng mới
        const newRoom = await pb.collection('rental_rooms').create(roomData);
        console.log(`Created new room from Facebook: ${room.title}`);
        
        // Kiểm tra tiêu chí và gửi thông báo
        this.checkMatchingCriteria(newRoom);
      }
    } catch (error) {
      console.error(`Error saving Facebook room data:`, error);
    }
  }
  
  /**
   * Kiểm tra phòng có phù hợp với tiêu chí nào không
   */
  private async checkMatchingCriteria(room: any): Promise<void> {
    try {
      const pb = getPocketBase();
      
      // Tìm các tiêu chí phù hợp
      const criteria = await pb.collection('room_criteria').getFullList({
        filter: `active = true && 
                minPrice <= ${room.price} && 
                maxPrice >= ${room.price} && 
                minArea <= ${room.area} && 
                maxArea >= ${room.area} &&
                (roomType = "any" || roomType = "${room.roomType}")`,
      });
      
      // Kiểm tra từng tiêu chí
      for (const criterion of criteria) {
        // Kiểm tra vị trí
        if (criterion.location && !room.location.includes(criterion.location)) {
          continue;
        }
        
        // Tạo thông báo cho người dùng
        if (criterion.notifyEmail) {
          await pb.collection('notifications').create({
            user: criterion.user,
            room: room.id,
            criteria: criterion.id,
            status: 'pending',
            type: 'email',
          });
        }
        
        if (criterion.notifyPush) {
          await pb.collection('notifications').create({
            user: criterion.user,
            room: room.id,
            criteria: criterion.id,
            status: 'pending',
            type: 'push',
          });
        }
      }
    } catch (error) {
      console.error('Error checking matching criteria:', error);
    }
  }
  
  /**
   * Cập nhật thời gian crawl gần nhất cho group
   */
  private async updateGroupLastCrawled(groupId: string): Promise<void> {
    try {
      const pb = getPocketBase();
      const groups = await pb.collection('fb_groups').getList(1, 1, {
        filter: `groupId = "${groupId}"`,
      });
      
      if (groups.items.length > 0) {
        await pb.collection('fb_groups').update(groups.items[0].id, {
          lastCrawled: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error updating last crawled time for group ${groupId}:`, error);
    }
  }
  
  /**
   * Chạy crawler
   */
  public async run(): Promise<void> {
    console.log('Starting Facebook crawler...');
    
    try {
      // Lưu trạng thái công việc
      const pb = getPocketBase();
      const job = await pb.collection('crawl_jobs').create({
        sourceType: 'facebook',
        parameters: { maxPosts: this.maxPosts },
        status: 'running',
        lastRun: new Date().toISOString(),
        enabled: true,
        roomsFound: 0,
      });
      
      let totalRooms = 0;
      
      // Lấy danh sách nhóm Facebook
      const groups = await this.getEnabledGroups();
      
      // Duyệt qua từng nhóm
      for (const group of groups) {
        console.log(`Fetching posts from group ${group.name} (${group.groupId})...`);
        
        try {
          // Lấy bài viết từ nhóm
          const posts = await this.getGroupPosts(group.groupId);
          console.log(`Found ${posts.length} posts in group ${group.name}`);
          
          // Phân tích từng bài viết
          for (const post of posts) {
            const roomData = await this.parseRoomPost(post);
            
            if (roomData) {
              await this.saveRoomData(roomData);
              totalRooms++;
            }
          }
          
          // Cập nhật thời gian crawl
          await this.updateGroupLastCrawled(group.groupId);
        } catch (groupError) {
          console.error(`Error processing group ${group.name}:`, groupError);
          continue; // Bỏ qua nhóm này, tiếp tục với nhóm tiếp theo
        }
      }
      
      // Cập nhật trạng thái công việc
      await pb.collection('crawl_jobs').update(job.id, {
        status: 'completed',
        roomsFound: totalRooms,
      });
      
      console.log(`Facebook crawler completed. Found ${totalRooms} rooms.`);
    } catch (error) {
      console.error('Error running Facebook crawler:', error);
      
      // Cập nhật trạng thái lỗi
      try {
        const pb = getPocketBase();
        const jobs = await pb.collection('crawl_jobs').getFullList({
          filter: `sourceType = "facebook" && status = "running"`,
          sort: '-created',
        });
        
        if (jobs.length > 0) {
          await pb.collection('crawl_jobs').update(jobs[0].id, {
            status: 'failed',
            error: (error as Error).message,
          });
        }
      } catch (updateError) {
        console.error('Error updating job status:', updateError);
      }
    }
  }
}
