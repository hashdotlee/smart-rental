interface EmailTemplateParams {
  userName: string;
  roomTitle: string;
  roomPrice: number;
  roomArea: number;
  roomLocation: string;
  roomId: string;
  appUrl: string;
}

/**
 * Tạo HTML email thông báo phòng trọ mới
 */
export function createRoomNotificationEmail(params: EmailTemplateParams): string {
  const {
    userName,
    roomTitle,
    roomPrice,
    roomArea,
    roomLocation,
    roomId,
    appUrl
  } = params;
  
  const formattedPrice = roomPrice.toLocaleString('vi-VN');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thông Báo Phòng Trọ Mới</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f7fb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding: 20px 0;
      background-color: #4f46e5;
      color: white;
      border-radius: 8px 8px 0 0;
      margin: -20px -20px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 0 20px;
    }
    .room-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin: 20px 0;
    }
    .room-title {
      background-color: #f3f4f6;
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 18px;
      font-weight: 600;
    }
    .room-details {
      padding: 15px;
    }
    .room-detail {
      margin-bottom: 10px;
    }
    .room-detail strong {
      font-weight: 600;
      color: #4f46e5;
    }
    .cta-button {
      display: inline-block;
      background-color: #4f46e5;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thông Báo Phòng Trọ Mới</h1>
    </div>
    <div class="content">
      <p>Xin chào ${userName},</p>
      <p>Chúng tôi vừa tìm thấy một phòng trọ phù hợp với tiêu chí tìm kiếm của bạn:</p>
      
      <div class="room-card">
        <div class="room-title">${roomTitle}</div>
        <div class="room-details">
          <div class="room-detail"><strong>Giá:</strong> ${formattedPrice} đồng/tháng</div>
          <div class="room-detail"><strong>Diện tích:</strong> ${roomArea} m²</div>
          <div class="room-detail"><strong>Địa chỉ:</strong> ${roomLocation}</div>
        </div>
      </div>
      
      <p>Để xem thêm thông tin chi tiết và liên hệ, vui lòng nhấn vào nút bên dưới:</p>
      
      <div style="text-align: center;">
        <a href="${appUrl}/rooms/${roomId}" class="cta-button">Xem Chi Tiết Phòng Trọ</a>
      </div>
      
      <p>Nếu phòng trọ này không phù hợp, bạn có thể điều chỉnh tiêu chí tìm kiếm trong trang cài đặt tài khoản.</p>
    </div>
    <div class="footer">
      <p>Trân trọng,</p>
      <p>Đội ngũ Tìm Phòng Trọ</p>
      <p>© ${new Date().getFullYear()} Tìm Phòng Trọ - Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</body>
</html>
  `;
}
