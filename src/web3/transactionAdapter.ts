import { TransactionAdapter, TransactionResult } from './types';

export class MockTransactionAdapter implements TransactionAdapter {
  async sendTransaction(amount: number, cause: string): Promise<TransactionResult> {
    console.log(`[Simulation] Sending ${amount} GSO to ${cause}`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = `SIM-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
        resolve({
          success: true,
          txHash
        });
      }, 1500);
    });
  }
}
