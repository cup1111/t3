import { api, HydrateClient } from "~/trpc/server";
import { AuthForm } from "~/app/_components/authform";
import { LatestPost } from "~/app/_components/post";
import { PageHeader } from "~/app/_components/page_header";

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex justify-center min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950">
        <div className="bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-slate-900/20 border-x border-slate-800/50 w-full md:max-w-2xl backdrop-blur-sm">
          <PageHeader />
          <AuthForm />
          <LatestPost />
        </div>
      </main>
    </HydrateClient>
  );
}