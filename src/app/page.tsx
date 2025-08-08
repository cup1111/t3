import { api, HydrateClient } from "~/trpc/server";
import { AuthForm } from "~/app/_components/authform";
import { LatestPost } from "~/app/_components/post";
import { PageHeader } from "~/app/_components/page_header";

export default async function Home() {

  return (
    <HydrateClient>
      <main className="flex justify-center min-h-screen bg-black">
        <div className="bg-black border-x border-slate-800 w-full md:max-w-2xl">
          <PageHeader />
          <AuthForm />
          <LatestPost />
        </div>
      </main>
    </HydrateClient>
  );
}