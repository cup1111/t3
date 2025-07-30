"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { api } from "~/trpc/react";

export function AuthForm() {
    const { user, isSignedIn } = useUser();
    const { data } = api.post.getAll.useQuery();
    if (isSignedIn) {
      return (
        <div className="flex items-center gap-4">
          <span className="text-sm text-white">
            welcome, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}!
          </span>
          <UserButton />
        </div>
      );
    }
    return (
        <div className="flex items-center gap-4">
          <SignInButton />
          <SignUpButton />
        </div>
      );
}