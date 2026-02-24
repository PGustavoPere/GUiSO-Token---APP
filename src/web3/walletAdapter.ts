import { WalletAdapter } from './types';

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
