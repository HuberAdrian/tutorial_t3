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

import { useState } from "react";

dayjs.extend(relativeTime);


// post something new
const CreatePostWizard = () => {
  const {user} = useUser();

  const [input, setInput] = useState("");

  // get new post in feed after posted by grap the context cache 
  const ctx = api.useContext();

  const {mutate, isLoading: isPosting } = api.posts.create.useMutation(
    { 
      onSuccess: () => {
        setInput("");
        void ctx.posts.getAll.invalidate(); // invalidate the cache, void because it's a promise, we don't care about the result, only that is running in the background
      }
    }
  );


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
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button
        onClick={() => mutate({content: input})}> Post </button>
    </div>
  );
};


// post view

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
            <span className="text-2xl" >{post.content}</span>
          </div>
      </div>
    </>
  )
};



const Feed = () => {
  const {data, isLoading: postsLoading} = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col"> 
            {data.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
    </div>
  );
};



const Home: NextPage = () => {
  
  const {isLoaded: userLoaded, isSignedIn} = useUser();

  // start fetching asap (with react-query, we can fetch it once and it will be cached, "prefetching")
  api.posts.getAll.useQuery();


  // if user is not loaded, return empty div
  if (!userLoaded) return <div />;



  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" /> <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton /> 
            </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
