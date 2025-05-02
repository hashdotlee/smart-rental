import axios from 'axios';
import * as cheerio from 'cheerio';
import { getPocketBase } from '@/lib/db/pocketbase';
import { analyzeRoomData } from '@/lib/ai/analyzer';
import { extractLocationInfo } from '@/lib/utils/location';

interface ChoTotRoom {
  title: string;
  description: string;
  price: number;
  area: number;
  location: string;
  photos: string[];
  sourceUrl: string;
  sourceType: 'chotot';
  rawData: any;
}

export class ChoTotCrawler {
  private baseUrl = 'https://nha.chotot.com';
  private categoryPath = '/thue-phong-tro';
  private locationPath = '-ha-noi';
  private maxPages = 5;
  
  constructor() {}
  
  /**
   * Trích xuất thông tin cơ bản từ một bài đăng Chợ Tốt
   */
  private extractRoomData(html: string, url: string): ChoTotRoom {
    const $ = cheerio.load(html);
    
    // Trích xuất tiêu đề
    const title = $('.adviewTitle h1').text().trim();
    
    // Trích xuất giá
    const priceText = $('.adviewPrice span').first().text().trim();
    const price = this.parsePrice(priceText);
    
    // Trích xuất diện tích
    const areaText = $('span:contains("Diện tích:")').next().text().trim();
    const area = this.parseArea(areaText);
    
    // Trích xuất địa chỉ
    const location = $('span:contains("Địa chỉ:")').next().text().trim();
    
    // Trích xuất mô tả
    const description = $('.adviewDescriptionDetail').text().trim();
    
    // Trích xuất hình ảnh
    const photos: string[] = [];
    $('.image-gallery img').each((_, img) => {
      const src = $(img).attr('src');
      if (src) photos.push(src);
    });
    
    // Tạo đối tượng thông tin phòng
    return {
      title,
      description,
      price,
      area,
      location,
      photos,
      sourceUrl: url,
      sourceType: 'chotot',
      rawData: {
        title,
        price: priceText,
        area: areaText,
        location,
        description
      }
    };
  }
  
  /**
   * Parse giá từ chuỗi văn bản
   */
  private parsePrice(priceText: string): number {
    // Loại bỏ các ký tự không phải số
    const numericString = priceText.replace(/[^\d]/g, '');
    
    if (numericString) {
      // Chuyển đổi chuỗi thành số
      return parseInt(numericString, 10);
    }
    
    return 0;
  }
  
  /**
   * Parse diện tích từ chuỗi văn bản
   */
  private parseArea(areaText: string): number {
    // Tìm các số trong chuỗi
    const matches = areaText.match(/\d+(\.\d+)?/);
    
    if (matches && matches[0]) {
      // Chuyển đổi chuỗi thành số
      return parseFloat(matches[0]);
    }
    
    return 0;
  }
  
  /**
   * Lấy danh sách URL từ một trang danh sách
   */
  private async getListingUrls(page: number): Promise<string[]> {
    const urls: string[] = [];
    
    try {
      const url = `${this.baseUrl}${this.categoryPath}${this.locationPath}?page=${page}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Tìm các liên kết đến trang chi tiết phòng
      $('.adItem a.adItem__infoLink').each((_, link) => {
        const href = $(link).attr('href');
        if (href) {
          // Đảm bảo URL đầy đủ
          const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          urls.push(fullUrl);
        }
      });
    } catch (error) {
      console.error('Error fetching listing page:', error);
    }
    
    return urls;
  }
  
  /**
   * Lấy thông tin chi tiết từ một URL
   */
  private async getDetailData(url: string): Promise<ChoTotRoom | null> {
    try {
      const response = await axios.get(url);
      return this.extractRoomData(response.data, url);
    } catch (error) {
      console.error(`Error fetching detail page ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Lưu thông tin phòng vào database
   */
  private async saveRoomData(room: ChoTotRoom): Promise<void> {
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
        console.log(`Updated room: ${room.title}`);
      } else {
        // Tạo phòng mới
        await pb.collection('rental_rooms').create(roomData);
        console.log(`Created new room: ${room.title}`);
        
        // Kiểm tra tiêu chí và gửi thông báo
        this.checkMatchingCriteria(roomData);
      }
    } catch (error) {
      console.error(`Error saving room data:`, error);
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
   * Chạy crawler
   */
  public async run(): Promise<void> {
    console.log('Starting ChoTot crawler...');
    
    try {
      // Lưu trạng thái công việc
      const pb = getPocketBase();
      const job = await pb.collection('crawl_jobs').create({
        sourceType: 'chotot',
        parameters: { maxPages: this.maxPages },
        status: 'running',
        lastRun: new Date().toISOString(),
        enabled: true,
        roomsFound: 0,
      });
      
      let totalRooms = 0;
      
      // Duyệt qua các trang
      for (let page = 1; page <= this.maxPages; page++) {
        console.log(`Fetching page ${page}...`);
        
        // Lấy danh sách URL
        const urls = await this.getListingUrls(page);
        console.log(`Found ${urls.length} URLs on page ${page}`);
        
        // Lấy thông tin chi tiết từng phòng
        for (const url of urls) {
          const roomData = await this.getDetailData(url);
          
          if (roomData) {
            await this.saveRoomData(roomData);
            totalRooms++;
          }
          
          // Đợi một khoảng thời gian để tránh quá tải server
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Cập nhật trạng thái công việc
      await pb.collection('crawl_jobs').update(job.id, {
        status: 'completed',
        roomsFound: totalRooms,
      });
      
      console.log(`ChoTot crawler completed. Found ${totalRooms} rooms.`);
    } catch (error) {
      console.error('Error running ChoTot crawler:', error);
      
      // Cập nhật trạng thái lỗi
      try {
        const pb = getPocketBase();
        const jobs = await pb.collection('crawl_jobs').getFullList({
          filter: `sourceType = "chotot" && status = "running"`,
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
