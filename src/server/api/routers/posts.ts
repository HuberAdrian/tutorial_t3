import { z } from "zod";
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// filter out sensitive data from the user object
const filterUserforClient = (user: User) => {
  console.log(user);
  return {id: user.id, username: user.username, profileImageUrl: user.profileImageUrl, firstName: user.firstName,};
} 




export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async({ ctx }) => {
    const posts = await ctx.prisma.post.findMany(
      {
        take: 100,  
      }
    );

    // get user info for all posts using Clerk API
    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId), 
      limit: 100, // same as above
      })).map(filterUserforClient);

    return posts.map((post) => {

      const author = users.find((user) => user.id === post.authorId);

      if (!author) 
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR", 
          message: "Author for post not found",
          });
      

      return {
        post, 
        author: {
          ...author,
          username: author.username,
          firstName: author.firstName,
        },
      };
    });
  }),
});
