import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

import { api, RouterOutputs } from "~/utils/api";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";


const CreatePostWizard = () => {
  const user = useUser();

  // log userid to console 
  console.log(user);
  // if user is not signed in, return null
  if (!user) return null;

  return (
    <div className="flex w-full justify-left">
      <img 
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
      />
      <input 
        type="text"
        placeholder="What's on your mind?"
        className="bg-transparent grow outline-none"
      />
      </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const {post, author} = props;

  return (
    <>
      <div key={post.id} className="border-b border-slate-400 p-8"> 
                {post.content}
              </div>
    </>
  )
};



const Home: NextPage = () => {
  
  // fetching all posts
  const {data, isLoading} = api.posts.getAll.useQuery();

  const user = useUser();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>Something went wrong</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        ‹meta name="description" content="Generated by create-t3-app" /> <link rel="icon" href="/favicon.ico" />
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
