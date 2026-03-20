import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Merchant } from './merchantTypes';
import { useWallet } from '../../core/WalletProvider';

interface MerchantContextType {
  merchant: Merchant | null;
  registerMerchant: (name: string, city?: string, category?: string, addressOverride?: string) => void;
  isMerchant: boolean;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [merchants, setMerchants] = useState<Record<string, Merchant>>({});
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    if (isConnected && address && merchants[address]) {
      setMerchant(merchants[address]);
    } else {
      setMerchant(null);
    }
  }, [isConnected, address, merchants]);

  const registerMerchant = useCallback((name: string, city?: string, category?: string, addressOverride?: string) => {
    const targetAddress = addressOverride || address;
    if (!targetAddress) return;
    const newMerchant: Merchant = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      walletAddress: targetAddress,
      city,
      category,
    };
    setMerchants(prev => ({ ...prev, [targetAddress]: newMerchant }));
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
