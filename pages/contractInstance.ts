import { ethers } from "ethers";
import { ExternalProvider } from '@ethersproject/providers';

export default function getContractInstance(abi: ethers.ContractInterface, contractAddress: string) {
    const provider = new ethers.providers.Web3Provider(window.ethereum as unknown as ExternalProvider);
  const signer = provider.getSigner();
  const Contract = new ethers.Contract(contractAddress, abi, signer);
  return Contract;
}