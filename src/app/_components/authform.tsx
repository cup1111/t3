"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { CreatePostWizard } from "./create_post_wizard";
import { LoadingPage } from "./loading";

export function AuthForm() {
  const { isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <LoadingPage />;
  }
  
  if (isSignedIn) {
    return (
      <div className="border-b border-slate-800">
        <CreatePostWizard />
      </div>
    );
  }
  
  return (
    <div className="border-b border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">T3-emoji😄</h1>
          <p className="text-slate-400 text-sm">
            Share your thoughts with emojis
          </p>
        </div>
        
        <SignInButton mode="modal">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
            Sign In to Post
          </button>
        </SignInButton>
      </div>
    </div>
  );
}