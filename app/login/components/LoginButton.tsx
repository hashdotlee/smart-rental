// Sử dụng signIn và signOut
'use client';

import { signIn, signOut } from "next-auth/react";

export default function LoginLogoutButtons() {
  return (
    <div>
      <button onClick={() => signIn("facebook")}>
        Sign in with Facebook
      </button>
      
      <button onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  );
}
