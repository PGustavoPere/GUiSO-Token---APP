import { TransactionAdapter, TransactionResult } from './types';
import { ethers } from 'ethers';
import { GUISO_CONTRACT_ADDRESS, GUISO_ABI } from './contracts/guisoContract';

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

export class Web3TransactionAdapter implements TransactionAdapter {
  async sendTransaction(amount: number, cause: string): Promise<TransactionResult> {
    if (!(window as any).ethereum) {
      return { success: false, txHash: '', error: 'MetaMask not installed' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      // In a real scenario, we would interact with the smart contract.
      // For this testnet integration, we will send a 0 value transaction to the contract address
      // to generate a real transaction hash on Sepolia.
      
      const tx = await signer.sendTransaction({
        to: GUISO_CONTRACT_ADDRESS,
        value: 0,
        data: ethers.hexlify(ethers.toUtf8Bytes(`Support: ${cause} - ${amount} GSO`)) // Add some data to the tx
      });

      console.log('Transaction sent:', tx.hash);

      // Wait for 1 confirmation
      await tx.wait(1);

      return {
        success: true,
        txHash: tx.hash
      };
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return {
        success: false,
        txHash: '',
        error: error.message || 'Transaction failed'
      };
    }
  }
}
