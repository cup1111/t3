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
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">T3-emoji😄</h1>
        <p className="text-slate-400 text-lg">
          Share your thoughts with emojis
        </p>
      </div>
      
      <SignInButton mode="modal">
        <button className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors">
          Click to start
        </button>
      </SignInButton>
    </div>
  );
}