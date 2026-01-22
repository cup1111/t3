"use client";

import { api } from "~/trpc/react";
import { LoadingPage } from "./loading";
import { PostView } from "./post_view";
import { useMemo } from "react";

export function LatestPost() {
  const { data: posts, isLoading, error } = api.post.getAll.useQuery();

  const postElements = useMemo(() => {
    if (!posts || posts.length === 0) {
      return null;
    }

    return posts.map(({ post, author }) => (
      <PostView key={post.id} post={post} author={author} />
    ));
  }, [posts]);

  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">Error loading posts</p>
          <p className="text-slate-500 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="inline-flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No posts yet</p>
          <p className="text-slate-500 text-sm">Be the first to share something!</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {postElements}
    </div>
  );
}