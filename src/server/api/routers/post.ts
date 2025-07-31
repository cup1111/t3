import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";


const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
  };
};

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const clerk = await clerkClient();

    const users = (await clerk.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
    ).data.map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author?.username) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author not found" });
      return { post, author: {
        ...author,
        username: author.username,
      } };
    });
  }),
});
