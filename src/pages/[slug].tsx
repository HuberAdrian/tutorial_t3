import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";


const ProfileFeed = (props: {userId: string}) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;


  if (!data || data.length === 0) return <div>User has not posted</div>;


  return (
    
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};



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
      <PageLayout>
        <div className="relative h-36 bg-slate-600 ">
          <Image src={data?.profileImageUrl ?? ""} alt="Profile Image" height={128} width={128} className="absolute bottom-0 left-0 -mb-[64px] ml-4 border-4 border-black bg-black " />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold" >{`@${usernameVar}`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data?.id ?? ""} />
      </PageLayout>
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
