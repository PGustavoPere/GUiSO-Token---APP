import { ethers } from 'ethers';
import { GUISO_CONTRACT_ADDRESS, GUISO_ABI } from './contracts/guisoContract';

export interface TokenBalanceResult {
  balance: number;
  formatted: string;
}

export class TokenBalanceService {
  async getBalance(address: string): Promise<TokenBalanceResult> {
    if (!(window as any).ethereum) {
      return { balance: 0, formatted: '0' };
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      
      // If the contract address is the zero address, we might be in a test environment without a real contract
      if (GUISO_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
        return { balance: 0, formatted: '0' };
      }

      const contract = new ethers.Contract(GUISO_CONTRACT_ADDRESS, GUISO_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals().catch(() => 18); // Default to 18 if decimals fails
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      const numericBalance = parseFloat(formattedBalance);

      return {
        balance: numericBalance,
        formatted: formattedBalance
      };
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      return { balance: 0, formatted: '0' };
    }
  }

  getImpactPower(balance: number, multiplier: number = 1.5): number {
    return Math.floor(balance * multiplier);
  }

  getInfluenceBadge(balance: number): string {
    if (balance >= 10000) return 'Pilar de la Comunidad';
    if (balance >= 5000) return 'Embajador de Impacto';
    if (balance >= 1000) return 'Agente Activo';
    return 'Aspirante';
  }
}

export const tokenBalanceService = new TokenBalanceService();
