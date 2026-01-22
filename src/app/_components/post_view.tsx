"use client";

import { api } from "~/trpc/react";
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from "~/server/api/root";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "~/contexts/auth-context";
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
  const { user: currentUser } = useAuth();
  const utils = api.useUtils();

  const { mutate: deletePost, isPending: isDeleting } =
    api.post.delete.useMutation({
      onSuccess: () => {
        toast.success("Post deleted successfully");
        void utils.post.getAll.invalidate();
        void utils.post.getByUserId.invalidate();
      },
      onError: () => {
        toast.error("Failed to delete post");
      },
    });

  const handleDelete = () => {
    deletePost({ postId: post.id });
  };

  const isAuthor = currentUser?.id === author.id;

  return (
    <div className="flex gap-4 p-5 border-b border-slate-800/50 hover:bg-gradient-to-r hover:from-slate-900/50 hover:via-slate-800/30 hover:to-slate-900/50 transition-all duration-200 group">
      <Link href={`/@${author.username}`} className="flex-shrink-0">
        <Image
          src={author.imageUrl ?? "/default-avatar.svg"}
          alt={`${author.username}'s profile image`}
          width={48}
          height={48}
          className="rounded-full h-12 w-12 ring-2 ring-slate-700/50 group-hover:ring-blue-500/50 transition-all"
        />
      </Link>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Link 
            href={`/@${author.username}`} 
            className="font-semibold text-white hover:text-blue-400 transition-colors"
          >
            @{author.username}
          </Link>
          <span className="text-slate-500">·</span>
          <span className="text-sm text-slate-500">
            {dayjs(post.createdAt).fromNow()}
          </span>
          {isAuthor && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-auto text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete post"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="text-white text-xl leading-relaxed break-words">
          {post.content}
        </div>
      </div>
    </div>
  );
}