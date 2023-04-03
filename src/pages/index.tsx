import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { string } from "zod";
import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);


// post something new
const CreatePostWizard = () => {
  const {user} = useUser();

  // if user is not signed in, return null
  if (!user) return null;

  return (
    <div className="flex w-full justify-left">
      <Image 
        alt="Profile Image"
        src={user.profileImageUrl}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input 
        type="text"
        placeholder="What's on your mind?"
        className="bg-transparent grow outline-none"
      />
      </div>
  );
};


// post view

// fetch data from api
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const {post, author} = props;

  return (
    <>
      <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4"> 
          <Image src={author.profileImageUrl} className="h-14 w-14 rounded-full" width={56} height={56} alt={"Profile Image"} />
          <div className="flex flex-col">
            <div className="flex gap-1 text-slate-300">
              <span>{`@${author.firstName}`}</span>
              <span className="front-thin" >{`• ${dayjs(post.createdAt).fromNow()}`}</span>
            </div>
            <span>{post.content}</span>
          </div>
      </div>
    </>
  )
};



const Home: NextPage = () => {
  
  // fetching all posts
  const {data, isLoading} = api.posts.getAll.useQuery();

  const user = useUser();

  if (isLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" /> <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!user.isSignedIn && (
            <div className="flex justify-center">
              <SignInButton /> 
            </div>
            )}
            {user.isSignedIn && <CreatePostWizard />}
          </div>
          <div className="flex flex-col"> 
            {[...data, ...data]?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
