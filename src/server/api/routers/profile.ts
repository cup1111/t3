import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(1, "Username cannot be empty")
          .max(100, "Username is too long")
          .trim(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { username } = input;

      const user = await ctx.db.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          imageUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return {
        id: user.id,
        username: user.username,
        imageUrl: user.imageUrl ?? "/default-avatar.svg",
        createdAt: user.createdAt,
      };
    }),
});
