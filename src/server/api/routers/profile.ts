import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { filterUserForClient } from "~/server/helpers/filterUserForClients";


export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const clerk = await clerkClient();
        const { username } = input;
        const user = (await clerk.users.getUserList({
            username: [username],
          })
          ).data.map(filterUserForClient);

        if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return user;
    }),
});
