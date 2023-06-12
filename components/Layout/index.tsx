import * as React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useDialogState } from 'ariakit';
import { useAccount } from 'wagmi';
import Header from './Header';
import Hero from './Hero';
import OnboardDialog from '~/components/Onboard';
import CustomToast from '~/components/CustomToast';
import StaleSubgraphWarning from '~/components/StaleSubgraphWarning';
import HowItWorks from './HowItWorks';
import { Nav } from './Nav';
import classNames from 'classnames';
import { useIsMounted } from '~/hooks';

interface ILayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({ children, className, ...props }: ILayoutProps) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const onboardDialog = useDialogState();
  const walletDialog = useDialogState();
  const isMounted = useIsMounted();

  return (
    <>
      <Head>
        <title>MyCfoChain</title>
      </Head>
      <StaleSubgraphWarning />

      <Header onboardDialog={onboardDialog} walletDialog={walletDialog} />

      <>
        {!isMounted || (router.pathname === '/' && !isConnected) ? (
          <>
            <Hero walletDialog={walletDialog} />
            <HowItWorks onboardDialog={onboardDialog} />
          </>
        ) : (
          <div className="flex flex-1 py-9 px-2 md:px-6 lg:px-8 lg:pl-0">
            <Nav />
            <main className={classNames('mx-auto max-w-7xl flex-1', className)} {...props}>
              {children}
            </main>
          </div>
        )}
      </>

      <OnboardDialog dialog={onboardDialog} />

      <CustomToast />
    </>
  );
}
