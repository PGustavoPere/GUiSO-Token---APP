import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

  // Persistence
  useEffect(() => {
    const savedAddress = localStorage.getItem('guiso_wallet_address');
    if (savedAddress) {
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockAddress = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;
    setAddress(mockAddress);
    setIsConnected(true);
    setIsConnecting(false);
    localStorage.setItem('guiso_wallet_address', mockAddress);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    localStorage.removeItem('guiso_wallet_address');
  }, []);

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
