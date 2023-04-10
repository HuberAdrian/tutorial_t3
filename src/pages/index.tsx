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
import { LoadingPage, LoadingSpinner } from "~/components/loading";

import { useState } from "react";
import { toast } from "react-hot-toast";

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
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        
        if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage [0]);
        } 
        else {
        toast.error ("Failed to post! Please try again later.");
        }
      },
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault() ;
            if (input !== "") {
              mutate({content: input});
            }
            }
          }
        }
      />
      {input !== "" && !isPosting && ( 
      <button
        onClick={() => mutate({content: input})} > Post 
        </button>
      )}
      {/* show loading spinner when posted */}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
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
              <Link href={`/${author.username}`}>
                <span>{`@${author.firstName}`}</span>
              </Link>
              <Link href={`/post/(${post.id}`}>
                <span className="front-thin" >{`• ${dayjs(post.createdAt).fromNow()}`}</span>
              </Link>
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
