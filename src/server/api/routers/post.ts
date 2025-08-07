import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


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
  create: privateProcedure.input(
    z.object({
      content: z.string().emoji("Only emojis are allowed").min(1).max(280),
    })
  ).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { content } = input;
    const post = await ctx.db.post.create({
      data: {
        content: content,
        authorId: userId,
      },
    });
    return post;
  }),
});
