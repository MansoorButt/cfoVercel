import { useState,useEffect } from 'react';
import getContractInstance from '~/pages/contractInstance';
import { ethers } from 'ethers';
import { CloseOutlined } from '@ant-design/icons';
import { Alert, Space, Spin } from 'antd';
import abi from 'erc-20-abi';
import { useAccount } from 'wagmi';
import { Balance } from '~/components/Icons/Balance';
import moment from 'moment';
import abi2 from './abi.json';
import { ExternalProvider } from '@ethersproject/providers';


const Modal = ({ isOpen, onClose ,contractAdd,option }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [namex, setNamex] = useState('');
  const [symbol, setSymbol] = useState('');
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [deci,setDeci]=useState(0);
  const [fetched,setFetched]= useState(false)
  const [confirmed,setConfirmed]= useState(false)
  const { address } = useAccount();
  const hexToDecimal = (hex) => parseInt(hex, 16);

  if (!isOpen) {
    return null;
  }

  

  async function checkTokenAddress(address1) {
    try {
      // Create an instance of the Contract class with the ERC20 ABI and provider
      const provider = new ethers.providers.JsonRpcProvider(
        'https://avalanche-fuji.infura.io/v3/7bbf53abf4b94068b4b8dbfdaf39571f'
      );
      //   const abi = ['function name() public view virtual override returns (string memory)'];
      const contract = new ethers.Contract(address1, abi, provider);  
      // Call a function on the contract to verify if it exists
      const x = await contract.name();
      const y = await contract.symbol();
      let a:any = moment().unix();
      const z = await contract.balanceOf(address);
      const d = await contract.decimals()
      console.log("This variable is",typeof(address1));
      setNamex(x);
      setSymbol(y);
      setDeci(d);
      setBalance(hexToDecimal(z._hex)/10**d);
      console.log(x);
      console.log('Balance', hexToDecimal(z._hex)/10**d);
      setFetched(true);

      // If the call is successful, the token address is valid
      return true;
    } catch (error) {
      // If an error occurs, the token address is not valid
      return false;
    }
  }

  async function deposit() {
    const contract = getContractInstance(abi2,contractAdd);
    let x = parseInt(amount);
    console.log("Amount is type of ",typeof(x));
    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
    console.log("token address is",tokenAddress)
    const Contract = new ethers.Contract(tokenAddress, abi, provider);
    const signer = provider.getSigner(); 
    const address2 = await signer.getAddress();
    console.log(address2);
    const contract3 = Contract.connect(signer); 
    const tx = await contract3.approve(contractAdd,ethers.constants.MaxUint256);
    tx.wait().then(async (receipt) => {
      // console.log(receipt);
      if (receipt && receipt.status == 1) {
        // transaction success.
        const tx2 = await contract.depositToken(tokenAddress,namex,symbol,amount);
      }
    });
  }

  

  async function handleCheckValidity() {
    const isValid = await checkTokenAddress(tokenAddress);
    setIsValid(isValid);
  }



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
      <div className="rounded-lg bg-white p-6 h-auto shadow-xl">
        <div className="flex flex-col">
          <div className="flex flex-row">
            {confirmed?(""):(<div><label className="mb-2 text-gray-800 mt-2 mr-2" htmlFor="tokenAddress">
              Token Address:
            </label>
            <input
              id="tokenAddress"
              type="text"
              className="mr-2 flex-grow rounded-md border border-gray-300 p-2"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />

            <label className="mb-2 text-gray-800 mt-2 mr-2" htmlFor="amount">
              Amount:
            </label>
            <input
              id="amount"
              type="text"
              className="mr-2 flex-grow rounded-md border border-gray-300 p-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className="primary-button ml-3" onClick={handleCheckValidity}>
              Check Validity
            </button></div>)}

            <CloseOutlined onClick={onClose} className="-mt-4" />
          </div>
          {fetched?(<div>
            <h1 className='font-exo text-xl'>Name : {namex}</h1>
            <h1 className='font-exo text-xl'>Symbol: {symbol}</h1>
            <h1 className='font-exo text-xl'>Balance : {balance}</h1>
            <h2 className='font-exo text-xl'>Decimals : {deci}</h2>
            <h1 className='font-exo text-xl'>Amount : {amount}</h1>
            <h1 className='font-exo text-xl'>Employer Address : {address}</h1>
            <h1 className='font-exo text-xl'>Contract Address : {contractAdd}</h1>
            {!confirmed?<div className='flex flex-row justify-center mt-2'><button className="primary-button justify center" onClick={()=>setConfirmed(true)}>Confirm</button></div>:""}
            {confirmed?(<div className='flex flex-row justify-center mt-2'><button className="primary-button justify center" onClick={deposit}>Deposit</button></div>):("")}
          </div>):("Enter Token Address")}
        </div>
      </div>
    </div>
  );
};

export default Modal;
