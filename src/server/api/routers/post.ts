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

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

// Create a new ratelimiter, that allows 3 requests per 100 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "100 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});


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
    const { success } = await ratelimit.limit(userId);
    if (!success) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You are posting too fast. Please wait a moment before posting again." });
    }
    const post = await ctx.db.post.create({
      data: {
        content: content,
        authorId: userId,
      },
    });
    return post;
  }),
});
