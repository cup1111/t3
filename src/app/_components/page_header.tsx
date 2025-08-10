"use client";

import { usePathname } from "next/navigation";
import { UserButton, SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export function PageHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  
  const getTitle = () => {
    if (pathname === "/") {
      return "T3-emoji";
    }

    const userMatch = /^\/@([^\/]+)$/.exec(pathname);
    if (userMatch) {
      return `@${userMatch[1]}`;
    }
    
    const postMatch = /^\/post\/(.+)$/.exec(pathname);
    if (postMatch) {
      return "Post";
    }
    
    return "T3-emoji😄";
  };

  const isProfilePage = /^\/@([^\/]+)$/.exec(pathname);
  const currentUsername = user?.username;

  return (
    <div className="sticky top-0 z-10 bg-black border-b border-slate-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {pathname !== "/" && (
            <Link href="/" className="text-white hover:text-slate-300 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </Link>
          )}
          
          <div>
            <h1 className="text-xl font-bold text-white">{getTitle()}</h1>

          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isProfilePage && currentUsername && pathname === `/@${currentUsername}` && (
            <SignOutButton>
              <button className="px-3 py-1 text-slate-400 hover:text-white transition-colors text-sm">
                Logout
              </button>
            </SignOutButton>
          )}
          <UserButton />
        </div>
      </div>
    </div>
  );
}
