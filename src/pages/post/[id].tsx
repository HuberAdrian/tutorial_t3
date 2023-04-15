import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";
import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postview";



const SinglePostPage: NextPage<{ id: string}> = ({id}) => {
  const {data} = api.posts.getById.useQuery({
    id,
  });

  // theere is no loading state, because we are using getStaticProps, so we prefetch the data before the page loads
  // only no data state is possible

  if (!data) return <div>404</div>;
  

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};



export const getStaticProps: GetStaticProps = async (context) => { // : GetStaticProps is a type def from Next.js

  // helper for SSG
  const ssg = generateSSGHelper()
  const id = context.params?.id;


  if (typeof id !== "string") throw new Error("no id");



  // fetch data
  await ssg.posts.getById.prefetch({id});

  return {
    props: {
      // pass the dehydrated state to the client
      trpcState: ssg.dehydrate(),
      id,
     },
  }
};


export const getStaticPaths = () => {

  return {
    paths: [],
    fallback: "blocking",
  };
};



export default SinglePostPage;
