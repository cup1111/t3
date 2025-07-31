"use client";

import { useUser, SignInButton, SignUpButton, SignOutButton} from "@clerk/nextjs";
import { api } from "~/trpc/react";
import Image from "next/image";

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;
  console.log(user.id);
  return (
    <div className="flex-1 flex border-2 border-slate-400 p-4 gap-2">
      <Image src={user.imageUrl} alt={`${user.username}'s profile image`} width={48} height={48} className="rounded-full"/>
      <span className="text-sm text-white">{user.username}</span>
      <input placeholder="Type your post here..." className="flex-1 bg-transparent outline-none" />
    </div>
  )
}

export function AuthForm() {
    const { user, isSignedIn } = useUser();
    const { data } = api.post.getAll.useQuery();
    if (isSignedIn) {
      return (
        <div className="flex items-center gap-4">
          <CreatePostWizard />
        </div>
      );
    }
    return (
        <div className="flex items-center gap-4 border-2 border-blue-500 p-4">
          <SignInButton />
          <SignUpButton />
        </div>
      );
}