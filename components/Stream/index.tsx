import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Fallback, { FallbackContainer } from '~/components/Fallback';
import { StreamIcon } from '~/components/Icons';
import { StreamTable, DefaultStreamTable } from './Table';
import type { IStreamAndHistory } from '~/types';
import StreamMenu from './Menu';
import useStreamsAndHistory from '~/queries/useStreamsAndHistory';
import abi from '../Stream/CreateStream/abi.json';
import { useState, useEffect } from 'react';
import getContractInstance from '~/pages/contractInstance';
import moment, { now } from 'moment';
import { use } from 'echarts/core';
import { Connector, useAccount, useConnect } from 'wagmi';
import dynamic from "next/dynamic";

export function StreamSection() {
  const { data, isLoading, error } = useStreamsAndHistory();
  const { isConnecting, address } = useAccount();
  const [userInfo, setUserInfo] = useState<any[] | undefined>([]);
  const [userInfo2, setUserInfo2] = useState<any[] | undefined>([]);
  const t = useTranslations('Streams');

  const hexToDecimal = (hex) => parseInt(hex, 16);
  const contractAddress = '0xB85a70B76904f5F111b29d80581463aA74dde705';

  useEffect(() => {
    getInfo();
  }, []);

  let tx2, contract2;
  async function getInfo() {
    console.log('Has entered Retreival2 Fuction');
    contract2 = getContractInstance(abi, contractAddress);
    tx2 = await contract2.getData();
    // console.log(tx2);
    const user = tx2.filter((item) => item.addr === address && item.withdrawn === false && item.paused===false && item.cancelled===false);
    const user2 = tx2.filter((item) => item.addr === address && item.withdrawn === false && item.paused===true && item.cancelled===false);
    setTimeout(() => {
      setUserInfo2(user2);
      setUserInfo(user);
      console.log(user);
      console.log(userInfo);
      // console.log(moment().unix());
      // console.log(contract2)
    }, 2000);
  }

  let tx6;
  const handleClick = async (txId) => {
    const txid = hexToDecimal(txId._hex);
    const contract = getContractInstance(abi, contractAddress);
    try {
      tx6 = await contract.withdraw(txid);
      tx6.wait().then(async (receipt) => {
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

  return (
    <>
      <section className="w-full">
        <div className="section-header flex w-full flex-wrap items-center justify-between gap-[0.625rem]">
          <span className="flex items-center gap-[0.625rem]">
            <StreamIcon />
            <h1 className="font-exo">Available Transactions</h1>
          </span>

          <div className="flex flex-wrap gap-[0.625rem]">
            <StreamMenu />
          </div>
        </div>

        <div>
          {/* <h1>Hello world</h1> */}
          <div className="mt-4 w-max bg-gray-100 p-4 ">
            <table className="max-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-200 py-2 px-4 text-left">Transaction ID</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Token</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Amount</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Time</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Withdrawn</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Withdraw Now</th>
                </tr>
              </thead>
              <tbody>
                {userInfo?.length > 0 &&
                  userInfo.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                      <td className="py-2 px-4 text-center">{hexToDecimal(item.txId._hex)}</td>
                      <td className="py-2 px-4 text-center">{item.name}</td>
                      <td className="py-2 px-4 text-center">{hexToDecimal(item.number._hex)}</td>
                      <td className="py-2 px-4 text-center">
                        {moment.unix(hexToDecimal(item.time._hex)).format('MM/DD/YYYY')}
                      </td>
                      <td className="py-2 px-4 text-center">{item.withdrawn ? 'Yes' : 'No'}</td>
                      <td className="py-2 px-4 text-center">
                        <button
                          className="primary-button mt-2"
                          disabled={moment().unix() <= hexToDecimal(item.time._hex)}
                          onClick={() => handleClick(item.txId)}
                        >
                          WithDraw
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="section-header flex w-full flex-wrap items-center justify-between gap-[0.625rem] mt-6">
          <span className="flex items-center gap-[0.625rem]">
            <StreamIcon />
            <h1 className="font-exo">Paused Transactions</h1>
          </span>

          <div className="flex flex-wrap gap-[0.625rem]">
            <StreamMenu />
          </div>
        </div>
        <div className="mt-4 w-max bg-gray-100 p-4 ">
            <table className="max-w-full">
              <thead>
                <tr>
                  <th className="bg-gray-200 py-2 px-4 text-left">Transaction ID</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Token</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Amount</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Time</th>
                  <th className="bg-gray-200 py-2 px-4 text-left">Paused</th>
                </tr>
              </thead>
              <tbody>
                {userInfo2?.length > 0 &&
                  userInfo2.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-200'}>
                      <td className="py-2 px-4 text-center">{hexToDecimal(item.txId._hex)}</td>
                      <td className="py-2 px-4 text-center">{item.name}</td>
                      <td className="py-2 px-4 text-center">{hexToDecimal(item.number._hex)}</td>
                      <td className="py-2 px-4 text-center">
                        {moment.unix(hexToDecimal(item.time._hex)).format('MM/DD/YYYY')}
                      </td>
                      <td className="py-2 px-4 text-center">{item.paused ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

export function AltStreamSection({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data?: IStreamAndHistory;
}) {
  const t = useTranslations('Streams');
  return (
    <section className="w-full">
      <div className="section-header">
        <span className="flex items-center gap-[0.625rem]">
          <StreamIcon />
          <h1 className="font-exo">{t('heading')}</h1>
        </span>
      </div>
      {isLoading || isError || !data?.streams || data.streams?.length < 1 ? (
        <FallbackContainer>
          {isLoading ? null : isError ? <p>{t('error')}</p> : !data?.streams ? <p>{t('noActiveStreams')}</p> : null}
        </FallbackContainer>
      ) : (
        <DefaultStreamTable data={data.streams} />
      )}
    </section>
  );
}

export { CreateStream } from './CreateStream';
export { StreamTable } from './Table';
