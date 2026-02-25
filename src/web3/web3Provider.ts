import { AppMode, WalletAdapter, TransactionAdapter } from './types';
import { MockWalletAdapter, MetaMaskAdapter } from './walletAdapter';
import { MockTransactionAdapter, Web3TransactionAdapter } from './transactionAdapter';

class Web3Bridge {
  private mode: AppMode = 'simulation';
  private walletAdapter: WalletAdapter;
  private transactionAdapter: TransactionAdapter;

  constructor() {
    // Default to simulation
    this.walletAdapter = new MockWalletAdapter();
    this.transactionAdapter = new MockTransactionAdapter();
  }

  setMode(mode: AppMode) {
    this.mode = mode;
    if (mode === 'simulation') {
      this.walletAdapter = new MockWalletAdapter();
      this.transactionAdapter = new MockTransactionAdapter();
    } else {
      if ((window as any).ethereum) {
        this.walletAdapter = new MetaMaskAdapter();
        this.transactionAdapter = new Web3TransactionAdapter();
      } else {
        console.warn('MetaMask not found, falling back to simulation');
        this.walletAdapter = new MockWalletAdapter();
        this.transactionAdapter = new MockTransactionAdapter();
      }
    }
  }

  getMode(): AppMode {
    return this.mode;
  }

  getWallet(): WalletAdapter {
    return this.walletAdapter;
  }

  getTransaction(): TransactionAdapter {
    return this.transactionAdapter;
  }
}

export const web3Bridge = new Web3Bridge();
