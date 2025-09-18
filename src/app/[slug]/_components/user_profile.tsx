"use client";
import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { LoadingPage } from "~/app/_components/loading";
import { CreatePostWizard } from "~/app/_components/create_post_wizard";
import { PostView } from "~/app/_components/post_view";
import { PageHeader } from "~/app/_components/page_header";
import { useMemo } from "react";

interface UserProfileProps {
  user: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const { data: posts, isLoading, error } = api.post.getByUserId.useQuery({ 
    userId: user.id 
  });
  const { user: currentUser, isLoaded } = useUser();

  const postElements = useMemo(() => {
    if (!posts) return null;
    return posts.map(({ post, author }) => (
      <PostView key={post.id} post={post} author={author} showLink={false} />
    ));
  }, [posts]);

  return (
    <div className="flex flex-col bg-black min-h-screen">

      <PageHeader />


      <div className="relative">
        <div className="h-48 bg-slate-700 w-full"></div>
        

        <div className="absolute -bottom-16 left-4">
          <Image 
            src={user.imageUrl} 
            alt={`${user.username}&apos;s profile image`} 
            width={128} 
            height={128} 
            className="rounded-full border-4 border-black w-32 h-32"
          />
        </div>
      </div>


      <div className="pt-20 px-4 pb-4 border-b border-slate-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">@{user.username}</h2>
            <p className="text-slate-400 text-sm mt-1">
              {posts?.length ?? 0} posts
            </p>
          </div>
        </div>
      </div>

      {currentUser?.username === user.username && (
        <CreatePostWizard />
      )}


      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingPage />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Error loading posts</h3>
            <p className="text-slate-400 text-center max-w-sm">
              {error.message}
            </p>
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
            <p className="text-slate-400 text-center max-w-sm">
              When @{user.username} posts, they&apos;ll show up here.
            </p>
          </div>
        ) : (
          postElements
        )}
      </div>
    </div>
  );
}