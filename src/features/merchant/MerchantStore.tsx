import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Merchant } from './merchantTypes';
import { useWallet } from '../../core/WalletProvider';
import { db, handleFirestoreError } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

interface MerchantContextType {
  merchant: Merchant | null;
  registerMerchant: (name: string, city?: string, category?: string, addressOverride?: string) => Promise<void>;
  isMerchant: boolean;
  loading: boolean;
}

const MerchantContext = createContext<MerchantContextType | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected } = useWallet();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected || !address) {
      setMerchant(null);
      setLoading(false);
      return;
    }

    const normalizedAddress = address.toLowerCase();
    const unsub = onSnapshot(doc(db, 'merchants', normalizedAddress), (docSnap) => {
      if (docSnap.exists()) {
        setMerchant(docSnap.data() as Merchant);
      } else {
        setMerchant(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching merchant:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [isConnected, address]);

  const registerMerchant = useCallback(async (name: string, city?: string, category?: string, addressOverride?: string) => {
    const targetAddress = (addressOverride || address)?.toLowerCase();
    if (!targetAddress) {
      throw new Error("No hay una wallet conectada.");
    }

    const id = `MER-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMerchant: Merchant = {
      id,
      name,
      walletAddress: targetAddress,
      city: city || '',
      category: category || 'Comercio',
    };

    try {
      await setDoc(doc(db, 'merchants', targetAddress), newMerchant);
    } catch (error: any) {
      console.error("MerchantStore: Error in setDoc", error);
      handleFirestoreError(error, 'create', `merchants/${targetAddress}`);
    }
  }, [address]);

  return (
    <MerchantContext.Provider value={{
      merchant,
      registerMerchant,
      isMerchant: !!merchant,
      loading
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
