import { z } from "zod";
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { privateProcedure } from "~/server/api/trpc";

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
        orderBy: [{ createdAt: "desc" }], // desc = descending order (newest first)
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

  // with privateProcedure, you can access the user session data (know if they are logged in or not)
  create: privateProcedure.input(
    // make sure string is a valid emoji
    z.object({
      content: z.string().emoji().min(1).max(280), // cant be empty, max 280 chars
    })

  ).mutation(async ({ctx, input}) => {
    // may error already in middleware 
    const authorId = ctx.userId;
    
    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      },
    });
  
    return post;
  }),
});
