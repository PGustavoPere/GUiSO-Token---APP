import { WalletAdapter } from './types';
import { ethers } from 'ethers';
import { networkConfig } from './networkConfig';

export class MockWalletAdapter implements WalletAdapter {
  private address: string | null = null;

  async connect(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.address = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
        resolve(this.address);
      }, 1000);
    });
  }

  async disconnect(): Promise<void> {
    this.address = null;
  }

  getAddress(): string | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.address !== null;
  }
}

export class MetaMaskAdapter implements WalletAdapter {
  private address: string | null = null;

  async connect(): Promise<string> {
    if (!(window as any).ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      
      // Check if on BSC Testnet
      if (network.chainId !== BigInt(97)) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.bsc_testnet.chainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig.bsc_testnet],
            });
          } else {
            throw switchError;
          }
        }
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      this.address = accounts[0];
      return this.address!;
    } catch (error) {
      console.error('Failed to connect to MetaMask', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.address = null;
  }

  getAddress(): string | null {
    return this.address;
  }

  isConnected(): boolean {
    return this.address !== null;
  }
}
