import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface RoomData {
  title: string;
  description: string;
  price: number;
  area: number;
  location: string;
  rawData: any;
}

interface RoomAnalysis {
  dien_tich: number;
  vi_tri: string;
  gia: number;
  tien_ich: string[];
  loai_phong: 'private' | 'shared';
  danh_gia: string;
  diem: number;
}

// Lựa chọn model AI để sử dụng
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // 'openai' hoặc 'gemini'

/**
 * Phân tích dữ liệu phòng trọ bằng OpenAI
 */
async function analyzeWithOpenAI(roomData: RoomData): Promise<RoomAnalysis> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  const prompt = `
  Phân tích thông tin phòng trọ từ dữ liệu sau và trả về kết quả dạng JSON:

  Tiêu đề: ${roomData.title}
  
  Mô tả: ${roomData.description}
  
  Giá: ${roomData.price.toLocaleString('vi-VN')} đồng/tháng
  
  Diện tích: ${roomData.area} m²
  
  Địa chỉ: ${roomData.location}

  Dựa trên thông tin trên, hãy trích xuất và đánh giá:
  1. Xác nhận diện tích thực tế (dien_tich - số nguyên)
  2. Xác nhận vị trí chính xác (vi_tri - string)
  3. Xác nhận giá thực tế (gia - số nguyên, đơn vị đồng)
  4. Các tiện ích được đề cập (tien_ich - mảng các string)
  5. Loại phòng: 'private' (khép kín) hoặc 'shared' (ghép/chung chủ) (loai_phong - string)
  6. Viết nhận xét ngắn gọn về chất lượng phòng (danh_gia - string)
  7. Chấm điểm chất lượng phòng từ 1-10 (diem - số thập phân, làm tròn 1 chữ số)

  Trả về JSON có cấu trúc:
  {
    "dien_tich": số,
    "vi_tri": "string",
    "gia": số,
    "tien_ich": ["string1", "string2", ...],
    "loai_phong": "private|shared",
    "danh_gia": "string",
    "diem": số
  }
  
  Chỉ trả về đối tượng JSON, không có giải thích thêm.
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Hoặc 'gpt-3.5-turbo' nếu cần giảm chi phí
      messages: [
        { role: 'system', content: 'Bạn là trợ lý AI chuyên phân tích dữ liệu phòng trọ tại Việt Nam.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });
    
    const result = response.choices[0].message.content;
    
    if (result) {
      return JSON.parse(result) as RoomAnalysis;
    }
    
    throw new Error('Empty response from OpenAI');
  } catch (error) {
    console.error('Error analyzing room with OpenAI:', error);
    
    // Trả về phân tích mặc định nếu có lỗi
    return {
      dien_tich: roomData.area,
      vi_tri: roomData.location,
      gia: roomData.price,
      tien_ich: [],
      loai_phong: 'private',
      danh_gia: 'Không có đánh giá',
      diem: 5.0
    };
  }
}

/**
 * Phân tích dữ liệu phòng trọ bằng Google Gemini
 */
async function analyzeWithGemini(roomData: RoomData): Promise<RoomAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
  Phân tích thông tin phòng trọ từ dữ liệu sau và trả về kết quả dạng JSON:

  Tiêu đề: ${roomData.title}
  
  Mô tả: ${roomData.description}
  
  Giá: ${roomData.price.toLocaleString('vi-VN')} đồng/tháng
  
  Diện tích: ${roomData.area} m²
  
  Địa chỉ: ${roomData.location}

  Dựa trên thông tin trên, hãy trích xuất và đánh giá:
  1. Xác nhận diện tích thực tế (dien_tich - số nguyên)
  2. Xác nhận vị trí chính xác (vi_tri - string)
  3. Xác nhận giá thực tế (gia - số nguyên, đơn vị đồng)
  4. Các tiện ích được đề cập (tien_ich - mảng các string)
  5. Loại phòng: 'private' (khép kín) hoặc 'shared' (ghép/chung chủ) (loai_phong - string)
  6. Viết nhận xét ngắn gọn về chất lượng phòng (danh_gia - string)
  7. Chấm điểm chất lượng phòng từ 1-10 (diem - số thập phân, làm tròn 1 chữ số)

  Trả về JSON có cấu trúc:
  {
    "dien_tich": số,
    "vi_tri": "string",
    "gia": số,
    "tien_ich": ["string1", "string2", ...],
    "loai_phong": "private|shared",
    "danh_gia": "string",
    "diem": số
  }
  
  Chỉ trả về đối tượng JSON, không có giải thích thêm.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Trích xuất JSON từ văn bản phản hồi
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RoomAnalysis;
    }
    
    throw new Error('Invalid JSON response from Gemini');
  } catch (error) {
    console.error('Error analyzing room with Gemini:', error);
    
    // Trả về phân tích mặc định nếu có lỗi
    return {
      dien_tich: roomData.area,
      vi_tri: roomData.location,
      gia: roomData.price,
      tien_ich: [],
      loai_phong: 'private',
      danh_gia: 'Không có đánh giá',
      diem: 5.0
    };
  }
}

/**
 * Phân tích dữ liệu phòng trọ
 */
export async function analyzeRoomData(roomData: RoomData): Promise<RoomAnalysis> {
  if (AI_PROVIDER === 'gemini') {
    return analyzeWithGemini(roomData);
  } else {
    return analyzeWithOpenAI(roomData);
  }
}
