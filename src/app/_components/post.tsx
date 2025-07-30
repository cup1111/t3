"use client";

import { api } from "~/trpc/react";

export function LatestPost() {
  const { data: posts } = api.post.getAll.useQuery();

  return (
    <div>
      {posts?.map((post) => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}
