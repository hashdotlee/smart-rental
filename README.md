# Ứng dụng Tìm Phòng Trọ Thông Minh

Ứng dụng tìm kiếm phòng trọ tại Hà Nội sử dụng Next.js, PocketBase và AI để đánh giá chất lượng phòng trọ.

## Tính năng chính

- Thu thập thông tin phòng trọ từ Chợ Tốt và Facebook Groups
- Phân tích và đánh giá chất lượng phòng bằng AI (OpenAI hoặc Google Gemini)
- Tìm kiếm phòng trọ theo nhiều tiêu chí
- Đăng nhập qua Facebook hoặc email/password
- Thiết lập các tiêu chí tìm kiếm và nhận thông báo khi có phòng phù hợp
- Thông báo qua email và push notification
- Lưu phòng yêu thích và so sánh các phòng

## Yêu cầu hệ thống

- Node.js 18+
- Docker và Docker Compose (để chạy PocketBase và triển khai)
- Facebook Developer Account (để tạo App và sử dụng Facebook Login)
- OpenAI API Key hoặc Google Gemini API Key

## Cài đặt và Chạy

### Phát triển (Development)

1. Clone dự án:
   ```bash
   git clone https://github.com/yourusername/rental-finder.git
   cd rental-finder
