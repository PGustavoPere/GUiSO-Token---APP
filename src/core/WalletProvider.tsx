import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { web3Bridge } from '../web3/web3Provider';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const walletAdapter = web3Bridge.getWallet();

  // Persistence
  useEffect(() => {
    const savedAddress = localStorage.getItem('guiso_wallet_address');
    if (savedAddress) {
      // In a real app, we might need to re-verify connection
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const newAddress = await walletAdapter.connect();
      setAddress(newAddress);
      setIsConnected(true);
      localStorage.setItem('guiso_wallet_address', newAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [walletAdapter]);

  const disconnect = useCallback(async () => {
    await walletAdapter.disconnect();
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('guiso_wallet_address');
  }, [walletAdapter]);

  return (
    <WalletContext.Provider value={{ address, isConnected, isConnecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
