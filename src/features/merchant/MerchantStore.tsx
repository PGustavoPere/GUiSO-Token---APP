import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Merchant } from './merchantTypes';
import { useWallet } from '../../core/WalletProvider';

interface MerchantContextType {
  merchant: Merchant | null;
  registerMerchant: (name: string, city?: string, category?: string) => void;
  isMerchant: boolean;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [merchants, setMerchants] = useState<Record<string, Merchant>>(() => {
    const saved = localStorage.getItem('guiso_merchants');
    if (saved) {
      return JSON.parse(saved);
    }
    return {};
  });
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    if (Object.keys(merchants).length > 0) {
      localStorage.setItem('guiso_merchants', JSON.stringify(merchants));
    }
  }, [merchants]);

  useEffect(() => {
    if (isConnected && address && merchants[address]) {
      setMerchant(merchants[address]);
    } else {
      setMerchant(null);
    }
  }, [isConnected, address, merchants]);

  const registerMerchant = useCallback((name: string, city?: string, category?: string) => {
    if (!address) return;
    const newMerchant: Merchant = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      walletAddress: address,
      city,
      category,
    };
    setMerchants(prev => ({ ...prev, [address]: newMerchant }));
  }, [address]);

  return (
    <MerchantContext.Provider value={{
      merchant,
      registerMerchant,
      isMerchant: !!merchant
    }}>
      {children}
    </MerchantContext.Provider>
  );
};

export const useMerchantStore = () => {
  const context = useContext(MerchantContext);
  if (!context) throw new Error('useMerchantStore must be used within a MerchantProvider');
  return context;
};
