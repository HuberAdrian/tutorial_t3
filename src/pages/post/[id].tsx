import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";



const SinglePostPage: NextPage = () => {
  

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" /> <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <h1>Profile View</h1>
        </div>
      </main>
    </>
  );
};

export default SinglePostPage;
