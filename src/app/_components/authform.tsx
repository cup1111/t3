"use client";

import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";

const CreatePostWizard = () => {
  const { user } = useUser();
  const utils = api.useUtils();
  const { mutate: createPost, isPending } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void utils.post.getAll.invalidate();
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
  const [input, setInput] = useState("");

  if (!user) return null;
  return (
    <div className="flex-1 flex border-2 border-slate-400 p-4 gap-2">
      <Image src={user.imageUrl} alt={`${user.username}'s profile image`} width={48} height={48} className="rounded-full" />
      <span className="text-sm text-white">{user.username}</span>
      <input
        placeholder="Type your emoji here..."
        className="flex-1 bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPending}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              createPost({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPending && (
        <button onClick={() => createPost({ content: input })}>
          Post
        </button>
      )}
      {isPending && (
        <div className="flex items-center gap-3">
          <LoadingSpinner size={30} />
        </div>
      )}
    </div>
  )
}

export function AuthForm() {
  const { isSignedIn } = useUser();
  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <CreatePostWizard />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4 border-2 border-blue-500 p-4">
      <SignInButton />
      <SignUpButton />
    </div>
  );
}