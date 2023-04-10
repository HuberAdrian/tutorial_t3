import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";



const SinglePostPage: NextPage = () => {
  

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <h1>Post View</h1>
        </div>
      </main>
    </>
  );
};

export default SinglePostPage;
