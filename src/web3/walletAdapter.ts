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
      throw new Error('MetaMask no está instalado');
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      
      // Check if on BSC Testnet
      if (network.chainId !== BigInt(97)) {
        throw new Error('WRONG_NETWORK');
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      this.address = accounts[0];
      return this.address!;
    } catch (error) {
      console.error('Error al conectar con MetaMask', error);
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
