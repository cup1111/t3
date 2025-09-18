import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
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
          ).data.map(filterUserForClient)[0];

        if (!user?.username) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        return {
            ...user,
            username: user.username,
        };
    }),
});
