import { useUser } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";

export const CreatePostWizard = () => {
  const { user, isLoaded } = useUser();
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
    }
  });

  const handlePost = () => {
    if (input.trim() !== "") {
      createPost({ content: input });
    }
  };

  if (!isLoaded || !user) return null;
  
  return (
    <div className="flex w-full items-center gap-3 p-4 border-b border-t border-slate-400">
      <Image 
        src={user.imageUrl} 
        alt={`${user.username}&apos;s profile image`} 
        width={48} 
        height={48} 
        className="rounded-full w-12 h-12 flex-shrink-0" 
      />
      <div className="flex-1 flex items-center gap-3">
        <input
          placeholder="Enter your emoji here..."
          className="flex-1 bg-transparent outline-none text-white placeholder-slate-400 text-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handlePost();
            }
          }}
        />
        {input.trim() !== "" && !isPending && (
          <button 
            onClick={handlePost}
            className="px-4 py-2 bg-slate-500 text-white rounded-full font-medium hover:bg-slate-600 transition-colors"
          >
            Post
          </button>
        )}
        {isPending && (
          <div className="flex items-center gap-3">
            <LoadingSpinner size={20} />
          </div>
        )}
      </div>
    </div>
  )
}
  