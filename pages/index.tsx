import type { GetStaticPropsContext, NextPage } from 'next';
import * as React from 'react';
import Layout from '~/components/Layout';
import Balance from '~/components/Balance';
import { HistorySection } from '~/components/History';
import { StreamSection } from '~/components/Stream';
import { Connector, useAccount, useConnect,Address } from 'wagmi';

const Home: NextPage = () => {
  const { isConnected, address } = useAccount();
  return (
    <Layout className="flex flex-col gap-12">
       <div className='font-exo text-1xl font-bold'>Displaying Info for : {address}</div>
      <Balance />
      <StreamSection />
      <HistorySection />
    </Layout>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  return {
    props: {
      // You can get the messages from anywhere you like. The recommended
      // pattern is to put them in JSON files separated by language.
      messages: (await import(`translations/${context.locale}.json`)).default,
    },
  };
}

export default Home;
