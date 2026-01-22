import { useAuth } from "~/contexts/auth-context";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";

export const CreatePostWizard = () => {
  const { user, isLoading } = useAuth();
  const utils = api.useUtils();
  const [input, setInput] = useState("");

  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void utils.post.getAll.invalidate();
      void utils.post.getByUserId.invalidate();
      toast.success("Post created successfully");
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post. Please try again later.");
      }
    },
  });

  const handlePost = () => {
    if (input.trim() !== "") {
      createPost({ content: input });
    }
  };

  if (isLoading || !user) return null;
  
  return (
    <div className="border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-sm">
      <div className="flex w-full items-start gap-4 p-5">
        <Image
          src={user.imageUrl ?? "/default-avatar.svg"}
          alt={`${user.username}'s profile image`}
          width={48}
          height={48}
          className="rounded-full w-12 h-12 flex-shrink-0 ring-2 ring-slate-700/50 hover:ring-blue-500/50 transition-all"
        />
        <div className="flex-1 flex flex-col gap-3">
          <div className="relative">
            <input
              placeholder="What's on your mind? Share an emoji..."
              className="w-full px-4 py-3 bg-slate-800/40 text-white rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800/60 transition-all duration-200 border border-slate-700/40 hover:border-slate-600/60 placeholder:text-slate-500 text-base"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePost();
                }
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Press Enter to post
            </div>
            {input.trim() !== "" && !isPending && (
              <button 
                onClick={handlePost}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 active:scale-95"
              >
                Post
              </button>
            )}
            {isPending && (
              <div className="flex items-center gap-2 px-5 py-2">
                <LoadingSpinner size={18} />
                <span className="text-sm text-slate-400">Posting...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
  