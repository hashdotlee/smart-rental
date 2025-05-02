export interface User {
  id: string;
  name: string;
  email: string;
  facebookId?: string;
  facebookAccessToken?: string;
  pushSubscription?: PushSubscription;
  created: string;
  updated: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface Criteria {
  id: string;
  user: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minArea: number;
  maxArea: number;
  utilities: string[];
  roomType: 'private' | 'shared';
  notifyEmail: boolean;
  notifyPush: boolean;
  created: string;
  updated: string;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  area: number;
  location: string;
  utilities: string[];
  roomType: 'private' | 'shared';
  sourceUrl: string;
  sourceType: 'chotot' | 'facebook';
  photos?: string[];
  aiScore?: number;
  aiAnalysis?: RoomAnalysis;
  created: string;
  updated: string;
}

export interface RoomAnalysis {
  dien_tich: number;
  vi_tri: string;
  gia: number;
  tien_ich: string[];
  loai_phong: 'private' | 'shared';
  danh_gia: string;
  diem: number;
}

export interface Notification {
  id: string;
  user: string;
  room: string;
  status: 'pending' | 'sent' | 'failed';
  type: 'email' | 'push';
  created: string;
  sent?: string;
}
