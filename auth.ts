import NextAuth from "next-auth";
import { PocketBaseAdapter } from "@/lib/auth/pocketBaseAdapter";
import { getPocketBase } from "@/lib/db/pocketbase";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PocketBaseAdapter(getPocketBase()),
  providers: [
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "email,public_profile,groups_access_member_info",
        },
      },
    }),
    Credentials({
      name: "PocketBase",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const pb = getPocketBase();
          const authData = await pb.collection('users').authWithPassword(
            credentials.email as string,
            credentials.password as string
          );
          
          return {
            id: authData.record.id,
            email: authData.record.email,
            name: authData.record.name,
            image: authData.record.avatar ? pb.files.getUrl(authData.record, authData.record.avatar) : null,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      // Lưu thông tin từ tài khoản Facebook vào token
      if (account && account.provider === "facebook") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider;
        
        // Lưu facebookId từ profile
        if (profile) {
          token.facebookId = profile.id;
        }
      }
      
      // Lưu thông tin user từ lần đăng nhập đầu tiên
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Chuyển thông tin từ token sang session để client có thể sử dụng
      if (token) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
        session.user.facebookId = token.facebookId as string;
        session.accessTokenExpiresAt = token.expiresAt as number;
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // Xử lý sau khi người dùng đăng nhập thành công
      if (account?.provider === "facebook" && profile) {
        try {
          const pb = getPocketBase();
          
          // Kiểm tra xem có user với email này trong PocketBase chưa
          const existingUsers = await pb.collection('users').getList(1, 1, {
            filter: `email = "${profile.email}"`,
          });
          
          let userId;
          
          if (existingUsers.items.length > 0) {
            // Nếu đã có user, lấy id
            userId = existingUsers.items[0].id;
          } else {
            // Nếu chưa có, tạo user mới
            const newUser = await pb.collection('users').create({
              email: profile.email,
              name: profile.name,
              verified: true,
            });
            
            userId = newUser.id;
          }
          
          // Kiểm tra và cập nhật tài khoản Facebook
          const existingFbAccounts = await pb.collection('fb_accounts').getList(1, 1, {
            filter: `user = "${userId}" && facebookId = "${profile.id}"`,
          });
          
          if (existingFbAccounts.items.length > 0) {
            // Cập nhật token
            await pb.collection('fb_accounts').update(existingFbAccounts.items[0].id, {
              accessToken: account.access_token,
              expiresAt: new Date(Number(account?.expires_at) * 1000).toISOString(),
            });
          } else {
            // Tạo mới
            await pb.collection('fb_accounts').create({
              user: userId,
              facebookId: profile.id,
              accessToken: account.access_token,
              expiresAt: new Date(Number(account.expires_at) * 1000).toISOString(),
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error saving Facebook account:", error);
          return true; // Vẫn cho phép đăng nhập nếu lưu FB account thất bại
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
