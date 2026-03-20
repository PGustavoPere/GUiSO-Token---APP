import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { web3Bridge } from '../web3/web3Provider';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Wallet } from 'lucide-react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isWrongNetwork: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleDisconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setShowDisconnectModal(true);
  }, []);

  const handleChainChanged = useCallback((chainId: string) => {
    if (chainId !== '0x61') { // 97 in hex
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnect();
    } else {
      setAddress(accounts[0]);
    }
  }, [handleDisconnect]);

  // Event listeners
  useEffect(() => {
    const initWallet = async () => {
      if ((window as any).ethereum) {
        try {
          const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
          if (chainId === '0x61') {
            const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
            }
          } else {
            setIsWrongNetwork(true);
          }
        } catch (e) {
          console.error("Failed to auto-connect", e);
        }
      }
    };

    initWallet();

    if ((window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', handleChainChanged);
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [handleChainChanged, handleAccountsChanged, handleDisconnect]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setIsWrongNetwork(false);
    try {
      const currentAdapter = web3Bridge.getWallet();
      const newAddress = await currentAdapter.connect();
      setAddress(newAddress);
      setIsConnected(true);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.message === 'WRONG_NETWORK') {
        setIsWrongNetwork(true);
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const currentAdapter = web3Bridge.getWallet();
    await currentAdapter.disconnect();
    setAddress(null);
    setIsConnected(false);
    setIsWrongNetwork(false);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected, isConnecting, connect, disconnect, isWrongNetwork }}>
      {children}
      
      {/* Network Warning Modal */}
      <AnimatePresence>
        {isWrongNetwork && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Red Incorrecta</h3>
              <p className="text-gray-600 mb-8">
                Estás en una red incorrecta. Cambiá a BSC Testnet en tu billetera para continuar.
              </p>
              <button 
                onClick={disconnect}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Desconectar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disconnect Modal */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Billetera Desconectada</h3>
              <p className="text-gray-600 mb-8">
                Tu billetera se desconectó. Volvé a conectarla para continuar.
              </p>
              <button 
                onClick={() => {
                  setShowDisconnectModal(false);
                  connect();
                }}
                className="w-full py-4 bg-guiso-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-colors mb-3"
              >
                Conectar Billetera
              </button>
              <button 
                onClick={() => setShowDisconnectModal(false)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
