"use client";

import { useUser, SignInButton, SignUpButton, SignOutButton} from "@clerk/nextjs";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useState } from "react";

const CreatePostWizard = () => {
  const { user } = useUser();
  const utils = api.useUtils();
  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void utils.post.getAll.invalidate();
    }
  });
  const [input, setInput] = useState("");
  
  if (!user) return null;
  return (
    <div className="flex-1 flex border-2 border-slate-400 p-4 gap-2">
      <Image src={user.imageUrl} alt={`${user.username}'s profile image`} width={48} height={48} className="rounded-full"/>
      <span className="text-sm text-white">{user.username}</span>
      <input 
      placeholder="Type your emoji here..." 
      className="flex-1 bg-transparent outline-none" 
      value={input}
      onChange={(e) => setInput(e.target.value)}
      disabled={isPending}
      />
      <button onClick={() => createPost({ content: input })} disabled={isPending}>
        Post
      </button>
    </div>
  )
}

export function AuthForm() {
    const { isSignedIn } = useUser();
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