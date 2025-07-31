//import Link from "next/link";

//import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import { AuthForm } from "~/app/_components/authform";
import { LatestPost } from "~/app/_components/post";
export default async function Home() {
//  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getAll.prefetch();

  return (
    <HydrateClient>
      <main className="flex justify-center h-screen">
        <div className="bg-black border-2 border-slate-400 w-full md:max-w-2xl">
        <AuthForm />
        <LatestPost />
        </div>
      </main>
    </HydrateClient>
  );
}
