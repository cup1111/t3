// src/app/[slug]/page.tsx
import { HydrateClient } from "~/trpc/server";
import { createCaller } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { UserProfile } from "./_components/user_profile";

export default async function ProfilePage({ 
    params 
  }: { 
    params: Promise<{ slug: string }>
  }) {

    const { slug } = await params;
  
  const username = slug.slice(3);


const caller = createCaller(await createTRPCContext({ headers: new Headers() }));

const user = (await caller.profile.getUserByUsername({ username }));


if (!user) {
    return <div>User not found</div>;
}

return (
    <HydrateClient>
      <main className="flex justify-center min-h-screen bg-black">
        <div className="bg-black border-2 border-slate-400 w-full md:max-w-2xl">
          <UserProfile user={user} />
        </div>
      </main>
    </HydrateClient>
);

}