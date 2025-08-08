// src/app/_components/post-view.tsx
"use client";

import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "~/server/api/root";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

type RouterOutputs = inferRouterOutputs<AppRouter>;
type PostWithAuthor = {
  post: RouterOutputs["post"]["getAll"][number]["post"];
  author: RouterOutputs["post"]["getAll"][number]["author"];
};

interface PostViewProps {
  post: PostWithAuthor["post"];
  author: PostWithAuthor["author"];
  showLink?: boolean;
}

export function PostView({ post, author, showLink = true }: PostViewProps) {
  return (
    <div className="flex gap-3 p-4 border-b border-slate-400 hover:bg-slate-900 transition-colors">
      <Image 
        src={author.imageUrl} 
        alt={`${author.username}'s profile image`} 
        width={48} 
        height={48} 
        className="rounded-full h-12 w-12 flex-shrink-0"
      />
      <div className="flex flex-col flex-1">
        <div className="flex text-slate-300 font-medium gap-2 items-center">
          <Link href={`/@${author.username}`} className="hover:text-white transition-colors">
            <span>{`@${author.username}`}</span>
          </Link>
          {showLink ? (
            <Link href={`/post/${post.id}`} className="hover:text-white transition-colors">
              <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
            </Link>
          ) : (
            <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
          )}
        </div>
        <div className="text-white text-lg mt-1 leading-relaxed">{post.content}</div>
      </div>
    </div>
  );
}