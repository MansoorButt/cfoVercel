import { useState } from 'react';
import Image from 'next/image';
import { DisclosureState, Select, SelectArrow, SelectLabel, useSelectState } from 'ariakit';
import { InputAmountWithDuration } from '~/components/Form';
import { StreamIcon } from '~/components/Icons';
import gasEfficient from '~/public/gasEfficient.svg';
import multiChain from '~/public/multiChain.svg';
import classNames from 'classnames';
import Payer from './Payer';
import Payee from './Payee';
import ConnectWallet from '~/components/Onboard/ConnectWallet';

// TODO add translations
export default function HowItWorks({ onboardDialog }: { onboardDialog: DisclosureState }) {
  const select = useSelectState();
  const [showPayee, setPayee] = useState(false);

  return (
    <div className="mb-[-5rem] flex flex-col items-center justify-between gap-16 bg-orange-100 p-10 text-lp-gray-5 dark:bg-lp-gray-5 dark:text-lp-white sm:p-20 sm:!py-[4.5rem] xl:p-24">
      <div className="space-y-6 xl:space-y-4">
        <h2 className="font-exo mx-auto flex flex-col text-center text-[2.5rem] leading-[3rem]">
          <span className="font-bold text-red-400">MyCfoChain</span>
          
        </h2>
        <p className="max-w-[56rem] text-center text-xl">
          A Decentralized Transactional Platform
        </p>
      </div>

      
      
      
      <div className="mt-5 flex w-[calc(100vw-16px)] select-none flex-col gap-20 lg:mb-[-4.5rem]">
        <h2 className="font-exo text-center text-[1.75rem]">
          <span className="font-bold">Connect your Wallet Now</span>
          <ConnectWallet />
        </h2>

        
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Gas efficient',
    description: 'Deploying a LlamaPay stream is 3.2-3.7x cheaper than other services.',
    logo: gasEfficient,
  },
  {
    name: 'Multi-chain',
    description: 'Available on all EVM chains with all contracts sharing the same address across chains',
    logo: multiChain,
  },
];

const pros = [
  {
    name: 'Anyone can trigger a claim',
    description: 'Receive payment into centralized exchanges via a 3rd party wallet triggering the claim.',
  },
  {
    name: 'Never run out of balance',
    description: 'Opt to borrow money to fund streams, for when you forget to top-up your balance.',
  },
  {
    name: 'No precision errors',
    description: 'LlamaPay operates internally with 20 decimals which will keep precision errors to a minimum.',
  },
  {
    name: 'Stream indefinitely',
    description: 'Use LlamaPay to create streams with no end date - or set a custom end date. ',
  },
];
