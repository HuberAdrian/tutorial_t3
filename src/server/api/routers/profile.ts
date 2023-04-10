import { z } from "zod";
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { privateProcedure } from "~/server/api/trpc";





export const profileRouter = createTRPCRouter({
    // get User
    getUserByUsername: publicProcedure.input(z.object({username: z.string()})).query(async({ input }) => {  // we dont need to pass ctx here because we are not using prisma
        // get data from Clerk API
        const [user] = await clerkClient.users.getUserList({
            username: [input.username],   
        });

        // throw error if user not found
        if (!user) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR", 
                message: "User not found",
            });
        }
        
        // return user
        return user;
    }),
    
});
