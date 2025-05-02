import type { Adapter } from "next-auth/adapters";
import PocketBase from "pocketbase";

export function PocketBaseAdapter(pb: PocketBase): Adapter {
  return {
    async createUser(user) {
      const newUser = await pb.collection('users').create({
        email: user.email,
        emailVisibility: true,
        name: user.name,
        avatar: user.image,
      });

      return {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        image: newUser.avatar ? pb.files.getUrl(newUser, newUser.avatar) : null,
        emailVerified: newUser.verified ? new Date() : null,
      };
    },

    async getUser(id) {
      try {
        const user = await pb.collection('users').getOne(id);
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
          emailVerified: user.verified ? new Date() : null,
        };
      } catch (error) {
        return null;
      }
    },

    async getUserByEmail(email) {
      try {
        const userList = await pb.collection('users').getList(1, 1, {
          filter: `email = "${email}"`,
        });
        
        if (userList.items.length === 0) return null;
        
        const user = userList.items[0];
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
          emailVerified: user.verified ? new Date() : null,
        };
      } catch (error) {
        return null;
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      try {
        const fbAccountsList = await pb.collection('fb_accounts').getList(1, 1, {
          filter: `facebookId = "${providerAccountId}"`,
          expand: 'user',
        });
        
        if (fbAccountsList.items.length === 0) return null;
        
        const userRelation = fbAccountsList.items[0].expand?.user;
        if (!userRelation) return null;
        
        const user = userRelation as any;
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar ? pb.files.getUrl(user, user.avatar) : null,
          emailVerified: user.verified ? new Date() : null,
        };
      } catch (error) {
        return null;
      }
    },

    async updateUser(user) {
      const updatedUser = await pb.collection('users').update(user.id, {
        email: user.email,
        name: user.name,
        avatar: user.image,
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.avatar ? pb.files.getUrl(updatedUser, updatedUser.avatar) : null,
        emailVerified: updatedUser.verified ? new Date() : null,
      };
    },

    async linkAccount(account) {
      try {
        // Tìm user
        const user = await this.getUser(account.userId);
        if (!user) throw new Error("User not found");
        
        // Lưu account Facebook
        await pb.collection('fb_accounts').create({
          user: account.userId,
          facebookId: account.providerAccountId,
          accessToken: account.access_token,
          expiresAt: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
        });
        
        return account;
      } catch (error) {
        console.error("Error linking account:", error);
        return account;
      }
    },

    async unlinkAccount({ provider, providerAccountId }) {
      try {
        const fbAccountsList = await pb.collection('fb_accounts').getList(1, 1, {
          filter: `facebookId = "${providerAccountId}"`,
        });
        
        if (fbAccountsList.items.length > 0) {
          await pb.collection('fb_accounts').delete(fbAccountsList.items[0].id);
        }
        
        return;
      } catch (error) {
        console.error("Error unlinking account:", error);
        return;
      }
    },

    async createSession({ sessionToken, userId, expires }) {
      // PocketBase tự quản lý session nên chỉ cần trả về thông tin phù hợp
      return {
        id: userId,
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      try {
        // Giải mã JWT token để lấy user ID
        // Lưu ý: Đây là đơn giản hóa, thực tế cần xác minh token
        const userId = sessionToken.split(".")[0];
        
        const user = await this.getUser(userId);
        if (!user) return null;
        
        return {
          session: {
            id: userId,
            sessionToken,
            userId,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
          user,
        };
      } catch (error) {
        return null;
      }
    },

    async updateSession({ sessionToken }) {
      // PocketBase tự quản lý session nên chỉ cần trả về thông tin phù hợp
      return {
        id: sessionToken,
        sessionToken,
        userId: sessionToken.split(".")[0],
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
    },

    async deleteSession(sessionToken) {
      // PocketBase tự quản lý session nên không cần xử lý gì thêm
      return;
    },

    // Các hàm này chỉ triển khai mức cơ bản
    // Nếu cần xác thực email, bạn sẽ cần mở rộng chức năng
    async createVerificationToken() {
      throw new Error("Not implemented");
    },
    
    async useVerificationToken() {
      throw new Error("Not implemented");
    },
  };
}
