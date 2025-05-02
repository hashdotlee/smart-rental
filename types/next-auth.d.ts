import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accessToken?: string;
      facebookId?: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
    accessTokenExpiresAt?: number;
  }
  
  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
    facebookId?: string;
    isAdmin?: boolean;
  }
}
