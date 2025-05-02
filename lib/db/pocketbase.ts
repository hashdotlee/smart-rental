import PocketBase from 'pocketbase';

let pb: PocketBase;

export const getPocketBase = () => {
  if (!pb) {
    pb = new PocketBase(process.env.POCKETBASE_URL);
    
    // Auto authenticate with admin credentials in server context
    if (typeof window === 'undefined' && 
        process.env.POCKETBASE_ADMIN_EMAIL && 
        process.env.POCKETBASE_ADMIN_PASSWORD) {
      pb.collection("_superusers").authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD,
		{ cache: "no-store" }
      );
    }
  }
  
  return pb;
};

// Helper to ensure authenticated access to PocketBase
export const authPocketBase = async () => {
  const pb = getPocketBase();
  
  if (!pb.authStore.isValid) {
    if (process.env.POCKETBASE_ADMIN_EMAIL && process.env.POCKETBASE_ADMIN_PASSWORD) {
      pb.collection("_superusers").authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL,
        process.env.POCKETBASE_ADMIN_PASSWORD,
		{ cache: "no-store" }
      );
    } else {
      throw new Error('PocketBase authentication failed');
    }
  }
  
  return pb;
};
