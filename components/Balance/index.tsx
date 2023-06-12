import * as React from 'react';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';
import DepositField from './DepositField';
import { useBalances, useChainExplorer } from '~/hooks';
import type { IBalance } from '~/types';
import type { IFormData, TokenAction } from './types';
import { useDialogState } from 'ariakit';
import { BalanceAndSymbol } from './BalanceAndSymbol';
import { UntilDepleted } from './UntilDepleted';
import { MonthlyCost } from './MonthlyCost';
import Image from 'next/image';
import Fallback from '~/components/Fallback';
import { BalanceIcon } from '~/components/Icons';
import { useAccount } from 'wagmi';
import useTokenBalances from '~/queries/useTokenBalances';
import { BeatLoader } from '~/components/BeatLoader';
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import { useState, useEffect } from 'react';
import getContractInstance from '~/pages/contractInstance';
import { ethers } from 'ethers';
import { ExternalProvider } from '@ethersproject/providers';
import abi from '../Stream/CreateStream/abi.json';
import moment, { now } from 'moment';

const Balance = (props: { address?: string }) => {
  const { balances, noBalances, isLoading, isError } = useBalances(props.address);

  // function that returns chain explorer url based on the chain user is connected to
  const { url: chainExplorer, id } = useChainExplorer();

  const depositFormDialog = useDialogState();
  const depositFieldDialog = useDialogState();
  const withdrawFormDialog = useDialogState();
  const [hasMetaMask, setHasMetamask] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setHasMetamask(true);
      // connectContract()
      getInfo();
    }
  }, []);

  const [balance, setBalance] = useState(0);
  const [withdrawal, setWithdrawal] = useState(0);
  const [available, setAvailable] = useState(0);
  const [userMode, setUserMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [userInfo, setUserInfo] = useState<any[] | undefined>([]);

  const hexToDecimal = (hex) => parseInt(hex, 16);
  const contractAddress = '0xB85a70B76904f5F111b29d80581463aA74dde705';
  let tx2, tx3, tx4, tx5, Contract;
  async function getInfo() {
    if (isConnected) {
      try {
        console.log('Has entered Retreival Fuction');
      Contract = getContractInstance(abi, contractAddress);
      tx2 = await Contract.getDynamicArray(address)
      console.log("Tokens Received",tx2);
      tx3 = await Contract.balances(address,tx2[0][1]);
      // Create an array of Promises for fetching balances
      const balancePromises = tx2.map((item) => getBalance(item[1]));
      const withdrawalPromises = tx2.map((item) => getWithdrawal(item[1]));
      const availablePromises = tx2.map((item)=> getAvailable(item[1]));

  // Wait for all balance Promises to resolve
      const balances = await Promise.all(balancePromises);
      const withdrawals = await Promise.all(withdrawalPromises);
      const avails = await Promise.all(availablePromises);

  // Map the balances to the userInfo array
      const updatedUserInfo = tx2.map((item, index) => {
      return { ...item, balance: balances[index],with:withdrawals[index],avail:avails[index]};
       });
      setTimeout(() => {
        setUserInfo(updatedUserInfo)
        console.log("This is tx2",userInfo)
        // console.log(moment().unix());
        // setUserMode(true);
      }, 1000);
      } catch (error) {
        console.log(error);
      }
      
    }
  }

  async function getBalance(addres3) {
    Contract = getContractInstance(abi, contractAddress);
    tx3 = await Contract.balances(address,addres3);
    tx3 = hexToDecimal(tx3._hex);
    return tx3;
  }

  async function getWithdrawal(address3) {
    Contract = getContractInstance(abi, contractAddress);
    tx3= await Contract.withdrawals(address,address3);
    tx3 = hexToDecimal(tx3._hex);
    return tx3;
  }

  async function getAvailable(address3){
    Contract = getContractInstance(abi, contractAddress);
    tx3 = await Contract.viewAvailableAmount(address3);
    tx3 = hexToDecimal(tx3._hex);
    return tx3;
  }
  let tx7;
  async function withdrawAll(address3) {
    const contract = getContractInstance(abi, contractAddress);
    try {
      tx7 = await contract.withdrawAll(address3);
      console.log('token address',address3);
      tx7.wait().then(async (receipt) => {
        // console.log(receipt);
        if (receipt && receipt.status == 1) {
           // transaction success.
           window.location.reload();
        }
     });
    } catch (error) {
      console.log(error);
    }
  };

  const formData = React.useRef<null | IFormData>(null);

  const { data: tokens, isLoading: tokensLoading } = useTokenBalances();

  const { address, isConnected } = useAccount();

  const t0 = useTranslations('Common');
  const t1 = useTranslations('Balances');

  const handleToken = (actionType: TokenAction, balance: IBalance) => {
    if (actionType === 'deposit') {
      depositFormDialog.toggle();
    } else {
      withdrawFormDialog.toggle();
    }

    const token = tokens?.find((t) => t.tokenAddress.toLowerCase() === balance.address.toLowerCase()) ?? null;

    formData.current = {
      actionType,
      title: balance.name || balance.address,
      symbol: balance.symbol,
      selectedToken: token,
      userBalance: balance.amount,
      tokenDecimals: balance.tokenDecimals,
      tokenAddress: balance.address,
      tokenContract: balance.tokenContract,
      llamaContractAddress: balance.contractAddress,
      logoURI: balance.logoURI,
      submit: actionType === 'deposit' ? 'Deposit' : 'Withdraw',
    };
  };

  const showFallback = isLoading || noBalances || isError;
  const showActions = props.address === undefined;

  const t = useTranslations('Common');

  return (
    <section className={classNames('-mt-2', showFallback ? 'w-full' : 'w-fit')}>
      <div className="section-header flex w-full flex-col items-left justify-between gap-[0.625rem]">
        <span className="flex items-center gap-[0.625rem]">
          <BalanceIcon />
          <h1 className="font-exo">Token Balance</h1>
        </span>
        <div className='bg-gray-100 p-4 rounded-lg'>
        <table className="table-auto w-full text-sm font-exo ">
      <thead>
        <tr>
          <th className="bg-gray-200 py-2 px-4 text-left">Token Name</th>
          <th className="bg-gray-200 py-2 px-4 text-left">Balance</th>
          <th className="bg-gray-200 py-2 px-4 text-left">Withdrawals</th>
          <th className="bg-gray-200 py-2 px-4 text-left">Available</th>
          <th className="bg-gray-200 py-2 px-4 text-left">Withdraw</th>
        </tr>
      </thead>
      <tbody>
        {userInfo.map((item, index) => (
          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
            <td className="border px-4 py-2">{item[0]}</td>
            <td className="border px-4 py-2">{item.balance}</td>
            <td className="border px-4 py-2">{item.with}</td>
            <td className="border px-4 py-2">{item.avail}</td>
            <button className='primary-button mt-2 mb-2 ml-2 item-center' onClick={() => withdrawAll(item[1])}>Withdraw</button>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
      </div>
    </section>
  );
};

const tableCellClassnames =
  'whitespace-nowrap border border-[#C0C0C0] bg-[#F9FDFB] px-4 py-[6px] text-sm text-lp-gray-4 dark:border-[#3e3e42] dark:bg-neutral-800 dark:text-white';
const tableCellInlineStyles = {
  borderLeft: '1px dashed rgb(176 175 186 / 20%)',
};

export default Balance;
