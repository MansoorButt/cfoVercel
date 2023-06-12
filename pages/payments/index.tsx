import Layout from '~/components/Layout';
import * as React from 'react';
import { GetStaticPropsContext, NextPage } from 'next';
import PaymentsSection from '~/components/Payments';
import { Connector, useAccount, useConnect} from 'wagmi';
import { ethers } from "ethers";
import {useState,useEffect} from 'react'
import { ExternalProvider } from "@ethersproject/providers";
import abi from "../payments/abi.json";
import { Button } from 'ariakit';


const Payments: NextPage = () => {

  // const { isConnected, isConnecting , address } = useAccount();
  // const [hasMetaMask,setHasMetamask] = useState(false)
  // const [connected , setConnected]= useState(false)
  // const [name,setName]=useState("")
  // const [num,setNum] = useState(0);

  // const hexToDecimal = (hex) => parseInt(hex, 16);

  // useEffect(() => {
  //   if (typeof window.ethereum !== "undefined") {
  //     setHasMetamask(true);
  //     connectContract()
  //   }
  // },[]);

  // let contract,tx
  // async function connectContract(){
  //   try {
  //     console.log("Has entered Connection function")
  //     const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
  //     const signer = provider.getSigner();
  //     const contractAddress = "0x6087c99Ee6598D338205a97237EF404F77a206Ec";
  //     contract = new ethers.Contract(contractAddress, abi, signer);
  //     console.log(contract)
  //     tx =  await contract.name(address)
  //     console.log(tx)
  //     setName(tx)
  //     getCount()
  //     setConnected(true)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // let tx2,contract2
  // async function getCount(){
  //   try {
  //     console.log("Has entered Connection function")
  //     const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
  //     const signer = provider.getSigner();
  //     const contractAddress = "0x6087c99Ee6598D338205a97237EF404F77a206Ec";
  //     contract2 = new ethers.Contract(contractAddress, abi, signer);
  //     console.log(contract2)
  //     tx2 =  await contract2.balance(address)
  //     console.log(hexToDecimal(tx2._hex))
  //     setNum(hexToDecimal(tx2._hex))
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // let tx3,contract3
  // async function incrementCount(){
  //   try {
  //     console.log("Has entered Increment function")
  //     const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
  //     const signer = provider.getSigner();
  //     const contractAddress = "0x6087c99Ee6598D338205a97237EF404F77a206Ec";
  //     contract3 = new ethers.Contract(contractAddress, abi, signer);
  //     console.log(contract3)
  //     tx3 =  await contract3.incrementBalance()
  //     console.log(tx3)
  //     // location.reload()
  //     console.log("Balance Incremented Successfully")
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }


  return (
    <Layout>
      <PaymentsSection />
      <div className='flex flex-col justify-center font-exo h-80'>
        {/* <div className='flex flex-col text-center'><h1>Mansoor's Contract Implementation</h1>
        <div><h3 className='mb-4'>Address : {address} </h3>
        {!connected?(<button className="primary-button text-md py-2 px-5 text-center font-bold" aria-disabled="false" onClick={connectContract}>Connect to Contract</button>):
        (<div>
          <h2>Contract is Connected</h2>
          <h2>Welcome {name}</h2>
          <h3>Your Current Balance is {num}</h3>
          <button className="primary-button text-md py-2 px-5 text-center font-bold" aria-disabled="false" onClick={incrementCount}>Increment</button>
        </div>)
        }
        </div>
        </div> */}
      </div>
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
export default Payments;
