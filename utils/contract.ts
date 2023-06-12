import { llamaContractABI } from '~/lib/abis/llamaContract';
import { cfoContractABI } from '~/lib/abis/cfoContract';
import { factoryABI } from '~/lib/abis/llamaFactory';
import { cfoFactoryABI } from '~/lib/abis/cfoFactory';
import { ethers, Signer } from 'ethers';
import { getAddress, Interface } from 'ethers/lib/utils';
import { erc20ABI } from 'wagmi';

export type Provider = ethers.providers.BaseProvider;

export const createContract = (cId: string, provider: Provider) =>
  new ethers.Contract(getAddress(cId), cfoContractABI, provider); //llamaContractABI

export const createWriteContract = (id: string, signer: Signer) =>
  new ethers.Contract(getAddress(id), cfoContractABI, signer); //llamaContractABI

export const createFactoryWriteContract = (factoryAddress: string, signer: Signer) =>
  new ethers.Contract(getAddress(factoryAddress), cfoFactoryABI, signer); //factoryABI

export const LlamaContractInterface = new Interface(cfoContractABI); //llamaContractABI

export const ERC20Interface = new Interface(erc20ABI);
