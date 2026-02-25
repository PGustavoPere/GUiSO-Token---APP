export type AppMode = 'simulation' | 'web3';

export interface WalletAdapter {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): string | null;
  isConnected(): boolean;
}

export interface TransactionResult {
  success: boolean;
  txHash: string;
  error?: string;
}

export interface TransactionAdapter {
  sendTransaction(amount: number, cause: string): Promise<TransactionResult>;
  waitForTransaction(txHash: string): Promise<boolean>;
}

export interface Web3Config {
  mode: AppMode;
}
