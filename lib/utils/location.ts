interface LocationInfo {
  district: string | null;
  latitude?: number;
  longitude?: number;
}

export function extractLocationInfo(locationText: string): LocationInfo {
  // Các quận huyện của Hà Nội
  const districts = [
    'Ba Đình',
    'Bắc Từ Liêm',
    'Cầu Giấy',
    'Đống Đa',
    'Hà Đông',
    'Hai Bà Trưng',
    'Hoàn Kiếm',
    'Hoàng Mai',
    'Long Biên',
    'Nam Từ Liêm',
    'Tây Hồ',
    'Thanh Xuân',
    'Thường Tín',
    'Gia Lâm',
    'Đông Anh',
    'Thanh Trì',
    'Hoài Đức',
    'Thanh Oai',
    'Mê Linh',
    'Sóc Sơn',
    'Ba Vì',
    'Chương Mỹ',
    'Đan Phượng',
    'Mỹ Đức',
    'Phú Xuyên',
    'Phúc Thọ',
    'Quốc Oai',
    'Sơn Tây',
    'Thạch Thất',
    'Ứng Hòa'
  ];

  // Tìm tên quận trong chuỗi địa chỉ
  let district: string | null = null;
  
  for (const d of districts) {
    if (locationText.includes(d)) {
      district = d;
      break;
    }
  }

  return {
    district
  };
}
