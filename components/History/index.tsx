import * as React from 'react';
import useStreamsAndHistory from '~/queries/useStreamsAndHistory';
import Fallback, { FallbackContainer } from '~/components/Fallback';
import { HistoryIcon } from '~/components/Icons';
import { HistoryTable } from './Table';
import type { IStreamAndHistory } from '~/types';
import { useTranslations } from 'next-intl';
import abi from '../Stream/CreateStream/abi.json';
import { useState, useEffect } from 'react';
import getContractInstance from '~/pages/contractInstance';
import moment, { now } from 'moment';
import { use } from 'echarts/core';
import { Connector, useAccount, useConnect } from 'wagmi';

export function HistorySection() {
  const { data, isLoading, error } = useStreamsAndHistory();

  const t = useTranslations('History');
  const { isConnecting, address } = useAccount();
  const [userInfo, setUserInfo] = useState<any[] | undefined>([]);
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
    const user = tx2.filter((item) => item.addr === address && item.withdrawn === true);
    setTimeout(() => {
      setUserInfo(user);
      console.log(user);
      console.log(userInfo);
      // console.log(moment().unix());
      // console.log(contract2)
    }, 2000);
  }

  return (
    <section className="w-full">
      <div className="section-header">
        <span className="flex items-center gap-[0.625rem]">
          <HistoryIcon />
          <h1 className="font-exo">History of Withdrawn Transactions</h1>
        </span>
      </div>

      <div>
        {/* <h1>Hello World</h1> */}
        <div className="mt-4 w-max bg-gray-100 p-4 ">
          <table className="max-w-full">
            <thead>
              <tr>
                <th className="bg-gray-200 py-2 px-4 text-left">Transaction ID</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Token</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Amount</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Time</th>
                <th className="bg-gray-200 py-2 px-4 text-left">Withdrawn</th>
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function AltHistorySection({
  isLoading,
  isError,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  data?: IStreamAndHistory;
}) {
  const t = useTranslations('History');

  return (
    <section className="w-full">
      <div className="section-header">
        <span className="flex items-center gap-[0.625rem]">
          <HistoryIcon />
          <h1 className="font-exo">{t('heading')}</h1>
        </span>
      </div>

      {isLoading || isError || !data?.history || data.history?.length < 1 ? (
        <FallbackContainer>
          {isLoading ? null : isError ? (
            <p>{t('error')}</p>
          ) : !data?.history || data.history?.length < 1 ? (
            <p>{t('noHistoricalData')}</p>
          ) : null}
        </FallbackContainer>
      ) : (
        <HistoryTable data={data.history} />
      )}
    </section>
  );
}

export { HistoryTable } from './Table';
