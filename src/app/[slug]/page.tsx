// src/app/[slug]/page.tsx
import { api, HydrateClient } from "~/trpc/server";
import { notFound } from "next/navigation";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import Head from "next/head";
import { LatestPost } from "../_components/post";
import { AuthForm } from "../_components/authform";

export default async function ProfilePage({ 
    params 
  }: { 
    params: Promise<{ slug: string }>
  }) {

    const { slug } = await params;
  
  const username = slug.slice(3);


const caller = createCaller(await createTRPCContext({ headers: new Headers() }));

const user = (await caller.profile.getUserByUsername({ username }))[0];


if (!user) {
    return <div>User not found</div>;
}

return (
    <HydrateClient>
      <main className="flex justify-center min-h-screen bg-black">
        <div className="bg-black border-2 border-slate-400 w-full md:max-w-2xl">
          <div className="border-b border-slate-400 p-4">
            <h1 className="text-xl font-bold text-white">Home</h1>
          </div>
          <AuthForm />
          <LatestPost />
        </div>
      </main>
    </HydrateClient>
);

}