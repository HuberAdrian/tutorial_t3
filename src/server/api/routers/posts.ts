import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

// filter out sensitive data from the user object
const filterUserforClient = (user: User) => {
  return {id: user.id, username: user.username, profileImageUrl: user.profileImagUrl, firstName: user.firstName,};
} 




export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async({ ctx }) => {
    const posts = await ctx.prisma.post.findMany(
      {
        take: 100,  
      }
    );

    const users = (await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId), 
      limit: 100, // same as above
      })).map(filterUserforClient);

    console.log(users);

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
