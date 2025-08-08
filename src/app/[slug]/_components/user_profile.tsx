// src/app/[slug]/_components/user-profile.tsx
"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { LoadingPage } from "~/app/_components/loading";
import { CreatePostWizard } from "~/app/_components/authform";
import { PostView } from "~/app/_components/post_view";

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const { data: posts, isLoading } = api.post.getByUserId.useQuery({ 
    userId: user.id 
  });
  const { user: currentUser } = useUser();

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-400 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-slate-300 hover:text-white">
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">@{user.username}</h1>
            <p className="text-slate-400 text-sm">User Profile</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Image 
            src={user.imageUrl} 
            alt={`${user.username}'s profile image`} 
            width={80} 
            height={80} 
            className="rounded-full"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">@{user.username}</h2>
            <p className="text-slate-400 text-sm">
              {posts?.length || 0} posts
            </p>
          </div>
        </div>
      </div>

      {currentUser?.id === user.id && (
        <div className="border-b border-slate-400">
          <CreatePostWizard />
        </div>
      )}

      <div className="flex flex-col">
        {isLoading ? (
          <LoadingPage />
        ) : !posts || posts.length === 0 ? (
          <div className="flex justify-center p-8">
            <p className="text-slate-400">No posts yet</p>
          </div>
        ) : (
          posts.map(({ post, author }) => (
            <PostView key={post.id} post={post} author={author} showLink={false} />
          ))
        )}
      </div>
    </div>
  );
}