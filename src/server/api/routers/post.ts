import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClients";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis"; // see below for cloudflare and fastly adapters

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "100 s"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});


export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const posts = await ctx.db.post.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      if (posts.length === 0) {
        return [];
      }

      const clerk = await clerkClient();
      const authorIds = [...new Set(posts.map((post) => post.authorId))];

      let users = [];
      try {
        const clerkResponse = await clerk.users.getUserList({
          userId: authorIds,
          limit: 100,
        });
        users = clerkResponse.data.map(filterUserForClient);
      } catch (clerkError) {
        // If Clerk fails, return posts with basic author info
        return posts.map((post) => ({
          post,
          author: {
            id: post.authorId,
            username: `User_${post.authorId.slice(-6)}`,
            imageUrl: '/default-avatar.svg',
          }
        }));
      }

      return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);
        if (!author?.username) {
          return {
            post,
            author: {
              id: post.authorId,
              username: `User_${post.authorId.slice(-6)}`,
              imageUrl: '/default-avatar.svg',
            }
          };
        }
        return { 
          post, 
          author: {
            ...author,
            username: author.username,
          } 
        };
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch posts",
      });
    }
  }),
  create: privateProcedure.input(
    z.object({
      content: z.string().emoji("Only emojis are allowed").min(1).max(280),
    })
  ).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { content } = input;
    
    try {
      let rateLimitSuccess = true;
      try {
        const rateLimitResult = await ratelimit.limit(userId);
        rateLimitSuccess = rateLimitResult.success;
      } catch (rateLimitError: unknown) {
        // If rate limiting fails, allow the request to proceed
        rateLimitSuccess = true;
      }
      
      if (!rateLimitSuccess) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You are posting too fast. Please wait a moment before posting again." });
      }
      
      const post = await ctx.db.post.create({
        data: {
          content: content,
          authorId: userId,
        },
      });
      return post;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
        if (error.code.startsWith('P')) {
          if (error.code === 'P1001') {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database connection failed. Please try again later.",
            });
          }
          
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: "CONFLICT",
              message: "A post with this content already exists.",
            });
          }
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database error occurred. Please try again.",
          });
        }
        
        if (error.code === 'ENOTFOUND') {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Service temporarily unavailable. Please try again later.",
          });
        }
      }
      

      if (error instanceof Error && error.message?.includes('fetch failed')) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Service temporarily unavailable. Please try again later.",
        });
      }
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create post. Please try again.",
      });
    }
  }),
  getByUserId: privateProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ ctx, input }) => {
    const { userId } = input;
    
    const posts = await ctx.db.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const clerk = await clerkClient();
    const users = (await clerk.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })).data.map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
      if (!author?.username) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Author not found" 
        });
      }
      return { post, author: {
        ...author,
        username: author.username,
      } };
    });
  }),
  delete: privateProcedure
  .input(z.object({ postId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { postId } = input;

    const post = await ctx.db.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    });

    if (!post) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Post not found or you don't have permission to delete it" 
      });
    }

    await ctx.db.post.delete({
      where: {
        id: postId,
      },
    });

    return { success: true };
  }),

});
