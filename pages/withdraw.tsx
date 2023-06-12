import * as React from 'react';
import Layout from '~/components/Layout';
import { useAccount } from 'wagmi';
import { useNetworkProvider } from '~/hooks';
import { StreamIcon } from '~/components/Icons';
import abi from '../components/Stream/CreateStream/abi.json';
import getContractInstance from './contractInstance';
import moment, { now } from 'moment';
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useQuery } from '@tanstack/react-query';
import request, { gql } from 'graphql-request';

interface IWithdrawProps {
  resolvedAddress: string | null;
}

const Withdraw: NextPage<IWithdrawProps> = ({ resolvedAddress }) => {
  const getAllToken = gql`
    query getToken {
      tokenCreateds {
        id
        token
        blockNumber
        blockTimestamp
      }
    }
  `;

  const queryVariables = {};

  const loadtoken = () =>
    request('https://api.studio.thegraph.com/query/46515/cfochain/0.0.5', getAllToken, queryVariables);
  const queryName = 'tokenCreateds';
  const { isLoading, error, data, refetch } = useQuery([queryName], loadtoken);
  console.log('React Query is running');
  
    console.log(data);


  const { isConnected, address } = useAccount();
  const { unsupported } = useNetworkProvider();
  const [userInfo, setUserInfo] = useState<any[] | undefined>([]);
  const [userInfo2, setUserInfo2] = useState<any[] | undefined>([]);
  // Mansoor's Version

  useEffect(() => {
    connectContract();
  }, []);
  const hexToDecimal = (hex: string) => parseInt(hex, 16);
  const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);

  const contractAddress = '0xB85a70B76904f5F111b29d80581463aA74dde705';
  let tx2, contract2;

  async function connectContract() {
    console.log('Has entered Retreival2 Fuction');
    contract2 = getContractInstance(abi, contractAddress);
    tx2 = await contract2.getData();
    // console.log(tx2);
    const user = tx2.filter(
      (item: { sentBy: string | undefined; withdrawn: boolean; cancelled: boolean }) =>
        item.sentBy === address && item.withdrawn === false && item.cancelled === false
    );
    const user2 = tx2.filter(
      (item: { sentBy: string | undefined; withdrawn: boolean; cancelled: boolean }) =>
        item.sentBy === address && item.withdrawn === true && item.cancelled === false
    );
    setTimeout(() => {
      setUserInfo(user);
      setUserInfo2(user2);
      console.log(user);
      console.log(userInfo);
      // console.log(moment().unix());
      // console.log(contract2)
    }, 2000);
  }

  let tx6;
  const pauseStream = async (txId: { _hex: any }) => {
    const txid = hexToDecimal(txId._hex);
    const contract = getContractInstance(abi, contractAddress);
    try {
      tx6 = await contract.pauseStream(txid);
      const receipt = await provider.getTransactionReceipt(tx6.hash);
      tx6.wait().then(async (receipt) => {
        // console.log(receipt);
        if (receipt && receipt.status == 1) {
          // transaction success.
          connectContract();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const resumeStream = async (txId: { _hex: any }) => {
    const txid = hexToDecimal(txId._hex);
    const contract = getContractInstance(abi, contractAddress);
    try {
      tx6 = await contract.resumeStream(txid);
      console.log('Resume Successfull', tx6);
      const receipt = await provider.getTransactionReceipt(tx6.hash);

      tx6.wait().then(async (receipt) => {
        // console.log(receipt);
        if (receipt && receipt.status == 1) {
          // transaction success.
          connectContract();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cancelStream = async (txId: { _hex: any }) => {
    const txid = hexToDecimal(txId._hex);
    const contract = getContractInstance(abi, contractAddress);
    try {
      tx6 = await contract.cancelStream(txid);
      tx6.wait().then(async (receipt) => {
        // console.log(receipt);
        if (receipt && receipt.status == 1) {
          // transaction success.
          connectContract();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <section className="z-2 mx-auto ml-2 flex w-full max-w-lg flex-col gap-5">
        <h1>All Tokens</h1>
        {isLoading ? "Loading":data.tokenCreateds[0].token}
        <h1 className="font-exo flex items-center gap-[0.625rem] text-2xl font-semibold text-lp-gray-4">
          <StreamIcon />
          <span className="dark:text-white">Live Streams</span>
        </h1>

        <div className="mt-4 -ml-8 w-max bg-gray-100 p-4 ">
          <table className="max-w-full">
            <thead>
              <tr>
                <th className="bg-gray-200 py-2 px-4 text-left">Employee Address</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Transaction ID</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Token</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Amount</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Time</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Cancel</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Resume/Pause</th>
              </tr>
            </thead>
            <tbody>
              {userInfo?.length > 0 &&
                userInfo.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                    <td className="py-2 px-4 text-center">{item.addr}</td>
                    <td className="py-2 px-4 text-center">{hexToDecimal(item.txId._hex)}</td>
                    <td className="py-2 px-4 text-center">{item.name}</td>
                    <td className="py-2 px-4 text-center">{hexToDecimal(item.number._hex)}</td>
                    <td className="py-2 px-4 text-center">
                      {moment.unix(hexToDecimal(item.time._hex)).format('MM/DD/YYYY')}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button className="primary-button mt-2" onClick={() => cancelStream(item.txId)}>
                        Cancel
                      </button>
                    </td>
                    <td className="py-2 px-4 text-center">
                      {item.paused ? (
                        <button className="primary-button mt-2" onClick={() => resumeStream(item.txId)}>
                          Resume
                        </button>
                      ) : (
                        <button className="primary-button mt-2" onClick={() => pauseStream(item.txId)}>
                          Pause
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <h1 className="font-exo flex items-center gap-[0.625rem] text-2xl font-semibold text-lp-gray-4">
          <StreamIcon />
          <span className="dark:text-white">Withdrawn Streams</span>
        </h1>
        <div className="mt-4 -ml-8 w-max bg-gray-100 p-4 ">
          <table className="max-w-full">
            <thead>
              <tr>
                <th className="bg-gray-200 py-2 px-4 text-left">Employee Address</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Transaction ID</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Token</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Amount</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Time</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Withdrawn</th>
              </tr>
            </thead>
            <tbody>
              {userInfo2?.length > 0 &&
                userInfo2.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                    <td className="py-2 px-4 text-center">{item.addr}</td>
                    <td className="py-2 px-4 text-center">{hexToDecimal(item.txId._hex)}</td>
                    <td className="py-2 px-4 text-center">{item.name}</td>
                    <td className="py-2 px-4 text-center">{hexToDecimal(item.number._hex)}</td>
                    <td className="py-2 px-4 text-center">
                      {moment.unix(hexToDecimal(item.time._hex)).format('MM/DD/YYYY')}
                    </td>
                    <td className="py-2 px-4 text-center">{item.withdrawn ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default Withdraw;
