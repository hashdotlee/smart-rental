import { initializeScheduler } from './scheduler';

let isServerInitialized = false;

export function initServer() {
  // Chỉ chạy khởi tạo server một lần
  if (isServerInitialized) {
    return;
  }
  
  // Kiểm tra môi trường server
  if (typeof window === 'undefined') {
    console.log('Initializing server...');
    
    // Khởi tạo scheduler
    initializeScheduler();
    
    isServerInitialized = true;
    console.log('Server initialized');
  }
}
