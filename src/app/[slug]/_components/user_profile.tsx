// src/app/[slug]/_components/user_profile.tsx
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
    <div className="flex flex-col bg-black min-h-screen">
      <div className="sticky top-0 z-10 bg-black border-b border-slate-800">
        <div className="flex items-center gap-4 p-4">
          <Link href="/" className="text-white hover:text-slate-300 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">@{user.username}</h1>
            <p className="text-slate-400 text-sm">{posts?.length || 0} posts</p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-48 bg-slate-700 w-full"></div>
        
        <div className="absolute -bottom-16 left-4">
          <Image 
            src={user.imageUrl} 
            alt={`${user.username}'s profile image`} 
            width={128} 
            height={128} 
            className="rounded-full border-4 border-black"
          />
        </div>
      </div>

      <div className="pt-20 px-4 pb-4 border-b border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">@{user.username}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {posts?.length || 0} posts
            </p>
          </div>
          
          {currentUser?.username === user.username && (
            <button className="px-4 py-2 border border-slate-600 text-white rounded-full hover:bg-slate-800 transition-colors">
              Edit profile
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-800">
        <button className="flex-1 py-4 text-white font-medium border-b-2 border-blue-500">
          Posts
        </button>
        <button className="flex-1 py-4 text-slate-400 font-medium hover:text-white transition-colors">
          Replies
        </button>
        <button className="flex-1 py-4 text-slate-400 font-medium hover:text-white transition-colors">
          Media
        </button>
        <button className="flex-1 py-4 text-slate-400 font-medium hover:text-white transition-colors">
          Likes
        </button>
      </div>

      {currentUser?.username === user.username && (
        <div className="border-b border-slate-800">
          <CreatePostWizard />
        </div>
      )}

      <div className="flex flex-col">
        {isLoading ? (
          <LoadingPage />
        ) : !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 text-center max-w-sm">
              When @{user.username} posts, they'll show up here.
            </p>
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