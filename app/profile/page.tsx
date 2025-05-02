// Sử dụng useSession hook
'use client';

import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {session?.user?.name}</p>
      <p>Email: {session?.user?.email}</p>
    </div>
  );
}
