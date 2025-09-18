"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "./loading";
import { PostView } from "./post_view";
import { useMemo } from "react";

export function LatestPost() {
  const { data: posts, isLoading, error } = api.post.getAll.useQuery();
  const { user } = useUser();
  
  console.log('🔍 LatestPost status:', { posts, isLoading, error, user: !!user });
  
  const postElements = useMemo(() => {
    if (!posts || posts.length === 0) {
      return null;
    }
    
    return posts.map(({ post, author }) => (
      <PostView 
        key={post.id}
        post={post} 
        author={author} 
      />
    ));
  }, [posts]);

  if (!user) {
    console.log('❌ User not logged in');
    return null;
  }

  if (isLoading) {
    console.log('⏳ Loading posts...');
    return <LoadingPage />;
  }
  
  if (error) {
    console.error('❌ Error loading posts:', error);
    return (
      <div className="text-center text-red-400 p-4">
        Error loading posts: {error.message}
      </div>
    );
  }
  
  if (!posts || posts.length === 0) {
    console.log('📭 No posts found');
    return (
      <div className="text-center text-slate-400 p-4">
        No posts yet, be the first to post!
      </div>
    );
  }

  console.log(`✅ Successfully loaded ${posts.length} posts`);
  return (
    <div className="flex flex-col">
      {postElements}
    </div>
  );
}