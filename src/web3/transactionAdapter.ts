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

  async waitForTransaction(txHash: string): Promise<boolean> {
    console.log(`[Simulation] Waiting for confirmation of ${txHash}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
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

  async waitForTransaction(txHash: string): Promise<boolean> {
    if (!(window as any).ethereum) {
      return false;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // Wait for 1 confirmation with a 60s timeout
      const receipt = await provider.waitForTransaction(txHash, 1, 60000);
      
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      console.error('Failed to confirm transaction:', error);
      return false;
    }
  }
}
