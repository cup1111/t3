import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
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

      // Get all author information
      const authorIds = [...new Set(posts.map((post) => post.authorId))];
      const users = await ctx.db.user.findMany({
        where: {
          id: { in: authorIds },
        },
        select: {
          id: true,
          username: true,
          imageUrl: true,
        },
      });

      // Create user map
      const userMap = new Map(users.map((user) => [user.id, user]));

      return posts.map((post) => {
        const author = userMap.get(post.authorId);
        return {
          post,
          author: author
            ? {
                id: author.id,
                username: author.username,
                imageUrl: author.imageUrl ?? "/default-avatar.svg",
              }
            : {
                id: post.authorId,
                username: `User_${post.authorId.slice(-6)}`,
                imageUrl: "/default-avatar.svg",
              },
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
      content: z.string()
        .emoji("Only emojis are allowed")
        .min(1, "Content cannot be empty")
        .max(280, "Content cannot exceed 280 characters")
        .trim()
        .refine(
          (val) => val.length > 0,
          "Content cannot be empty after trimming"
        ),
    })
  ).mutation(async ({ ctx, input }) => {
    const { userId } = ctx;
    const { content } = input;
    
    // Additional sanitization: remove any potential whitespace issues
    const sanitizedContent = content.trim();
    
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
          content: sanitizedContent,
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
  getByUserId: publicProcedure
    .input(
      z.object({
        userId: z
          .string()
          .min(1, "User ID cannot be empty")
          .max(255, "User ID is too long"),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { userId } = input;

        const posts = await ctx.db.post.findMany({
          where: {
            authorId: userId,
          },
          orderBy: { createdAt: "desc" },
          take: 100,
        });

        if (posts.length === 0) {
          return [];
        }

        // Get all author information
        const authorIds = [...new Set(posts.map((post) => post.authorId))];
        const users = await ctx.db.user.findMany({
          where: {
            id: { in: authorIds },
          },
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        });

        // Create user map
        const userMap = new Map(users.map((user) => [user.id, user]));

        return posts.map((post) => {
          const author = userMap.get(post.authorId);
          return {
            post,
            author: author
              ? {
                  id: author.id,
                  username: author.username,
                  imageUrl: author.imageUrl ?? "/default-avatar.svg",
                }
              : {
                  id: post.authorId,
                  username: `User_${post.authorId.slice(-6)}`,
                  imageUrl: "/default-avatar.svg",
                },
          };
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user posts",
        });
      }
    }),
  delete: privateProcedure
  .input(z.object({ 
    postId: z.string().min(1, "Post ID cannot be empty").cuid("Invalid post ID format")
  }))
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
