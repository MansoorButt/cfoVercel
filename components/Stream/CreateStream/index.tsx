/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import Placeholder from './Placeholder';
import ErrorBoundary from './ErrorBoundary';
import { useBalances } from '~/hooks';
import { Connector, useAccount, useConnect } from 'wagmi';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { ExternalProvider } from '@ethersproject/providers';
import { StreamIcon } from '~/components/Icons';
import useTokenBalances from '~/queries/useTokenBalances';
import CreateMultipleStreams from './CreateMultipleStreams';
import { useTranslations } from 'next-intl';
import csvParser from 'csv-parser';
import { ChangeEvent } from 'react';
import abi from '../CreateStream/abi4.json';
import moment, { now } from 'moment';
import getContractInstance from '~/pages/contractInstance';
import Modal from './Modal';
import abi2 from './abi.json'


export const CreateStream = () => {
  const { isConnecting } = useAccount();

  const { isLoading, isError } = useBalances();

  const { data: tokens, isLoading: tokenBalancesLoading, isError: tokenBalancesError } = useTokenBalances();

  const loading = isConnecting || isLoading || tokenBalancesLoading;

  const error = isError || tokenBalancesError || !tokens;

  const t = useTranslations('CreateStream');

  const [parsedData, setParsedData] = useState<any[]>([]);
  const [active, setIsActive] = useState(false);
  const [addressInfo, setAddressInfo] = useState<any[] | undefined>([]);
  const [amountInfo, setAmountInfo] = useState<number[] | undefined>([]);
  const [timeInfo, setTimeInfo] = useState<number[] | undefined>([]);
  const [userInfo, setUserInfo] = useState<any[] | undefined>([]);
  const [total, setTotal] = useState<number | undefined>(0);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const csvData = reader.result as string;

        // Parse CSV data
        const results: any[] = [];
        const addres: any[] = [];
        const amount: any[] = [];
        const time: any[] = [];
        const numofMonths: any[] = [];

        csvParser({ separator: ',' })
          .on('data', (data) => results.push(data))
          .on('end', () => {
            // Process the parsed data
            setParsedData(results);
          })
          .write(csvData);
        console.log(results);
        let totalAmount=0;
        for (let i = 0; i < results.length; i++) {
          let x = results[i].NumberOfMonths;
          console.log('You want loo to go time :', x);
          if (x == 0) {
            const temp = results[i].Address.replace(`'`, `"`);
            // console.log(`"${temp}"`);
            addres.push(temp);
            amount.push(parseInt(results[i].Amount));
            totalAmount+=parseInt(results[i].Amount);
            time.push(moment(results[i].Time).unix());
          } else {
            const max = parseInt(x) + 1;
            console.log('Max is :', max);
            for (let j = 0; j < max; j++) {
              if (j == 0) {
                const temp = results[i].Address.replace(`'`, `"`);
                addres.push(temp);
                amount.push(parseInt(results[i].Amount));
                totalAmount+=parseInt(results[i].Amount);
                time.push(moment(results[i].Time).unix());
              } else {
                const temp = results[i].Address.replace(`'`, `"`);
                addres.push(temp);
                amount.push(parseInt(results[i].Amount));
                totalAmount+=parseInt(results[i].Amount);
                time.push(moment(results[i].Time).add(j, 'M').unix());
              }
            }
          }
          // console.log(moment(results[i].Time).unix());
        }
        console.log(addres);
        console.log(time);
        console.log("total is ",totalAmount);
        setTotal(totalAmount);
        setAddressInfo(addres);
        setAmountInfo(amount);
        setTimeInfo(time);

        setTimeout(() => {
          setIsActive(true);
          setParsedData(results);
        }, 1000);
      };

      reader.readAsText(file);
    }
  };

  const { isConnected, address } = useAccount();
  const [hasMetaMask, setHasMetamask] = useState(false);
  const [tknAdd, setTknAdd] = useState('');
  const [userMode, setUserMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [tknList,setTknList] = useState([]);

  const hexToDecimal = (hex) => parseInt(hex, 16);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      setHasMetamask(true);
      viewTokenList();
      // connectContract()
    }
  }, []);

  function userModeOn() {
    setAdminMode(false);
    setUserMode(true);
  }
  const contractAddress = '0x86aF33eB1c2a06F30A212304dB2e607F4141E8Ce';
  const contractAddress2 = '0xB85a70B76904f5F111b29d80581463aA74dde705'
  let contract, tx;
  async function connectContract() {
    try {
      console.log('Has entered contract function');
      //0x6DbaED3C836C3C3D141753B6c60FDe51b279A904
      contract = getContractInstance(abi2, contractAddress2);
      console.log(contract);
      // tx =  await contract.combineArrays(amount,addres);
      console.log('amount', amountInfo);
      console.log('adresses', addressInfo);
      console.log('Time', timeInfo);
      // tx = await contract.combineArrays(amountInfo, addressInfo, timeInfo);
      // // // tx = await contract.combinedArray(0)
      // console.log(tx);
      // console.log('Combined array', tx);
      let list = tknList
      let amount;
      
      console.log("Selected Option",selectedOption)
      list = list.find((item)=>item.name == selectedOption);
      amount = list.depositedAmount;
      list = list.token;
      console.log("Deposited Amount is ",parseInt(amount._hex, 16))
      console.log("Modified List",list);
      console.log("Total is :",total);
      amount = parseInt(amount._hex, 16);
      if(amount>=total){
      tx = await contract.combineArrays(amountInfo, addressInfo, timeInfo,list,selectedOption);}
      else{
        alert( "You have "+ amount + " " + selectedOption +" in your wallet " + "Kindly TopUp Your Wallet")
      }
      // console.log("Transaction successful",tx);
    } catch (error) {
      console.log(error);
    }
  }
  

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };
  const [tokenAddress, setTokenAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [namex, setNamex] = useState('');

  async function checkTokenAddress(address) {
    try {
      // Create an instance of the Contract class with the ERC20 ABI and provider
      const provider = new ethers.providers.JsonRpcProvider('https://avalanche-fuji.infura.io/v3/7bbf53abf4b94068b4b8dbfdaf39571f');
      const abi = ['function name() public view virtual override returns (string memory)'];
      const contract = new ethers.Contract(address, abi, provider);
  
      // Call a function on the contract to verify if it exists
      const x = await contract.name();
      setNamex(x);
      console.log(x);

  
      // If the call is successful, the token address is valid
      return true;
    } catch (error) {
      // If an error occurs, the token address is not valid
      return false;
    }
  }
  
  async function handleCheckValidity() {
    const isValid = await checkTokenAddress(tokenAddress);
    setIsValid(isValid);
  }

  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  async function viewTokenList() {
    const contract = getContractInstance(abi2,contractAddress2);
    let tx2 = await contract.getEmployerTokens(address);
    setTknList(tx2);
    console.log(tx2);
  }

  return (
    <section className="z-2 mx-auto flex w-max max-w-lg flex-col">
      <h1 className="font-exo mb-5 flex items-center gap-[0.625rem] text-2xl font-semibold text-lp-gray-4 dark:text-white">
        Create Bulk Payments
      </h1>
      <div>
        <label htmlFor="dropdown" className="block font-medium text-gray-700">
          Select a Token:
        </label>
        <div className='flex flex-row'>
        <select id="dropdown"
          name="dropdown"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
          value={selectedOption}
          onChange={handleSelect}>
        <option value="">Select an option</option>
        {tknList.map((option, index) => (
          <option key={index} value={option.name}>
            {option.name}
          </option>
        ))}
    </select>
        <div>
      <button
        className="ml-4 px-2 py-2 bg-blue-500 text-white rounded-md w-max mt-1"
        onClick={openModal}
      >
        Deposit New Token
      </button>
      <Modal isOpen={isModalOpen} onClose={closeModal} contractAdd={contractAddress2} option={selectedOption}/>
    </div>
        </div>
        {selectedOption && <p className="mt-2 text-gray-900">Selected Token: {selectedOption}</p>}
      </div>
      
      {selectedOption && <div>
        <h3>Add your CSV File below</h3>
        <input type="file" onChange={handleFileChange} />
      </div>}
      
      {/* <pre>{JSON.stringify(parsedData, null, 2)}</pre> */}
      {active && selectedOption ? (
        <button className="primary-button" onClick={connectContract}>
          Send Data
        </button>
      ) : (
        ''
      )}
      {selectedOption && <div>
        <table style={{ marginTop: '50px', marginLeft: '-100px' }}>
          <thead>
            <tr>{parsedData.length > 0 && Object.keys(parsedData[0]).map((key) => <th key={key}>{key}</th>)}</tr>
          </thead>
          <tbody>
            {parsedData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((cell, index) => (
                  <td style={{ paddingLeft: '30px', paddingRight: '40px' }} key={index}>
                    <br></br>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </section>
  );
};
