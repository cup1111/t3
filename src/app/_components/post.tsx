// src/app/_components/post.tsx
"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "./loading";
import { PostView } from "./post_view";

export function LatestPost() {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  const { user } = useUser();
  
  if (!user) return <div></div>;

  if (isLoading) {
    return <LoadingPage />;
  }
  
  if (!posts || posts.length === 0) {
    return <div>No posts found</div>;
  }

  return (
    <div className="flex flex-col">
      {posts.map(({ post, author }) => (
        <PostView 
          key={post.id}
          post={post} 
          author={author} 
        />
      ))}
    </div>
  );
}