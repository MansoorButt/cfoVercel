import * as React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { DisclosureState } from 'ariakit';
import { useTranslations } from 'next-intl';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import Menu from './Menu';
import { NetworksMenu, Account, WalletSelector } from '~/components/Web3';
import { FuelIcon, Logo } from '~/components/Icons';
import { useTheme } from 'next-themes';
import { useIsMounted } from '~/hooks';
import { Wallet } from 'ethers';

const Header = ({ onboardDialog, walletDialog }: { onboardDialog: DisclosureState; walletDialog: DisclosureState }) => {
  const { isConnected } = useAccount();

  const t = useTranslations('Common');

  const { setTheme, resolvedTheme } = useTheme();

  const isMounted = useIsMounted();

  const isDark = resolvedTheme === 'dark';

  return (
    <header className="flex items-center justify-between gap-10 border-b border-llama-teal-2 bg-llama-teal-1 bg-opacity-5 py-4 px-2 text-base dark:border-lp-gray-7 dark:bg-lp-gray-8 md:px-6 lg:px-8">
      <Link href="/">
        <span className="sr-only ">Navigate to Home Page</span>
        <h1 className="font-exo">MyCfoChain</h1>
      </Link>

      {isMounted && (
        <>
          <div className="flex flex-shrink-0 items-center justify-between gap-[0.625rem]">
            {isConnected ? (
              <>
                <NetworksMenu />
                <Account showAccountInfo={walletDialog.toggle} />
              </>
            ) : (
              <button className="nav-button-v2 hidden md:block" onClick={walletDialog.toggle}>
                {t('connectWallet')}
              </button>
            )}

            {/* Add a logo for notification here */}

            <Menu onboardDialog={onboardDialog} walletDialog={walletDialog} />
          </div>

          <WalletSelector dialog={walletDialog} />
        </>
      )}
    </header>
  );
};

export default Header;
