// src/app/_components/post-view.tsx
"use client";

import { api } from "~/trpc/react";
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "~/server/api/root";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

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
  const { user: currentUser } = useUser();
  const utils = api.useUtils();
  
  const { mutate: deletePost, isPending: isDeleting } = api.post.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted successfully");
      void utils.post.getAll.invalidate();
      void utils.post.getByUserId.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete post");
    }
  });

  const handleDelete = () => {
    deletePost({ postId: post.id });
  };

  const isAuthor = currentUser?.id === author.id;

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
        <div className="flex text-slate-300 font-medium gap-2 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/@${author.username}`} className="hover:text-white transition-colors">
              <span>{`@${author.username}`}</span>
            </Link>
            {showLink ? (
              <span className="hover:text-white transition-colors">
                <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
              </span>
            ) : (
              <span className="font-thin">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
            )}
          </div>
          
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-slate-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-900/20"
              title="Delete post"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="text-white text-lg mt-1 leading-relaxed">{post.content}</div>
      </div>
    </div>
  );
}