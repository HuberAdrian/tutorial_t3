import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { privateProcedure } from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { filterUserforClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";




const addUserDataToPosts = async (posts: Post[]) => {
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
};





// create rate limiter for posts that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 10 requests per 10 seconds
  analytics: true,
});




export const postsRouter = createTRPCRouter({


  // get a single post by id
  getById: publicProcedure.input(z.object({
    id: z.string(),
    })).query(async ({ctx, input}) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!post) throw new TRPCError({ code: "NOT_FOUND" });

    return (await addUserDataToPosts([post]))[0];
  }),
  
  
  getAll: publicProcedure.query(async({ ctx }) => {
    const posts = await ctx.prisma.post.findMany(
      {
        take: 100,  
        orderBy: [{ createdAt: "desc" }], // desc = descending order (newest first)
      });

    return addUserDataToPosts(posts);
  }),

  // get all posts by a specific user
  getPostsByUserId: publicProcedure.input(z.object ({
    userId: z.string(),
    })).query(({ctx, input}) => ctx.prisma.post.findMany({
    where: {
    authorId: input.userId,
    }, take: 100,
    orderBy: [{ createdAt: "desc" }], // desc = descending order (newest first)
  }).then(addUserDataToPosts)
  ),


  // with privateProcedure, you can access the user session data (know if they are logged in or not)
  create: privateProcedure.input(
    // make sure string is a valid emoji
    z.object({
      content: z.string().emoji("only Emojis allowed").min(1).max(280), // cant be empty, max 280 chars    //  custom error message for emojis only
    })

  ).mutation(async ({ctx, input}) => {
    // may error already in middleware 
    const authorId = ctx.userId;
    
    // rate limit posts
    const {success} = await ratelimit.limit(authorId);
    if (!success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You are posting too fast. Please wait a minute before posting again.",
      });
    }
    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content,
      },
    });
  
    return post;

  }),
});
