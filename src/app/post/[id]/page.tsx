"use client";

import { api } from "~/trpc/react";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/app/_components/loading";

dayjs.extend(relativeTime);

const SinglePost = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();
  const { user } = useUser();
  if (!user) return <div></div>;

    if (isLoading) {
        return <LoadingPage />;
    }
    if (!posts || posts.length === 0) {
        return <div>No posts found</div>;
    }

  return (
    <div className="flex justify-center h-screen">
        Post View
    </div>
  );
}

export default SinglePost;

