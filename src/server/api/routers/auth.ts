import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { hashPassword, verifyPassword } from "~/server/auth/password";
import { generateToken } from "~/server/auth/jwt";

export const authRouter = createTRPCRouter({
  /**
   * User registration
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(20, "Username must be at most 20 characters")
          .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        password: z
          .string()
          .min(6, "Password must be at least 6 characters")
          .max(100, "Password is too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, username, password } = input;

      // Check if email already exists
      const existingUserByEmail = await ctx.db.user.findUnique({
        where: { email },
      });

      if (existingUserByEmail) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      // Check if username already exists
      const existingUserByUsername = await ctx.db.user.findUnique({
        where: { username },
      });

      if (existingUserByUsername) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await ctx.db.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          imageUrl: user.imageUrl,
        },
      };
    }),

  /**
   * User login
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { email, password } = input;

      // Find user
      const user = await ctx.db.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          imageUrl: user.imageUrl,
        },
      };
    }),

  /**
   * Get current user information
   */
  getCurrentUser: privateProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Not authenticated",
      });
    }

    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: {
        id: true,
        email: true,
        username: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),
});
