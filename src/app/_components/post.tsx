"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "~/server/api/root";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "./loading";
import Link from "next/link";

dayjs.extend(relativeTime);

export function LatestPost() {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  const { user } = useUser();
  if (!user) return <div>Please sign in</div>;

  if (isLoading) {
    return <LoadingPage />;
  }
  if (!posts || posts.length === 0) {
    return <div>No posts found</div>;
  }

  
  type RouterOutputs = inferRouterOutputs<AppRouter>;
  type postWithAuthor = {
    post: RouterOutputs["post"]["getAll"][number]["post"];
    author: RouterOutputs["post"]["getAll"][number]["author"];
  }
  const PostView = (props: postWithAuthor) => {
    const { post, author } = props;
    return (
      <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400">
        <Image src={author.imageUrl} alt={`${author.username}'s profile image`} width={48} height={48} className="rounded-full h-12 w-12"/>
        <div className="flex flex-col">
          <div className="flex text-slate-300 font-medium gap-2">
            <Link href={`/${author.username}`}>
              <span>{`@${author.username}`}</span>
            </Link>
            <Link href={`/post/${post.id}`}>
              <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
            </Link>
          </div>
        <div className="text-2xl">{post.content}</div>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {posts.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
}
