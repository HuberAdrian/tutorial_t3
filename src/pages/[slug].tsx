import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";


const ProfilePage: NextPage<{ username: string}> = ({username}) => {
  let usernameVar = "Adrian";
  const {data} = api.profile.getUserByUsername.useQuery({
    username,
  });

  // theere is no loading state, because we are using getStaticProps, so we prefetch the data before the page loads
  // only no data state is possible

  if (data?.username) {
    usernameVar = data.username;
  }
  
  

  return (
    <>
      <Head>
        <title>{usernameVar}</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          {usernameVar}
        </div>
      </main>
    </>
  );
};


import { createProxySSGHelpers } from "@trpc/react-query/ssg"; import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superison from "superjson";

export const getStaticProps: GetStaticProps = async (context) => { // : GetStaticProps is a type def from Next.js

  // create helpers for SSG
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superison,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  // remove @ from username
  const username = slug.replace("@", "");

  // fetch data
  await ssg.profile.getUserByUsername.prefetch({ username });
  // prefetch lets us fetch data before and hydrate it through server side props 
  

  return {
    props: {
      // pass the dehydrated state to the client
      trpcState: ssg.dehydrate(),
      username,
     },
  }
};


export const getStaticPaths = () => {

  return {
    paths: [],
    fallback: "blocking",
  };
};



export default ProfilePage;
