import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Coins, Sparkles } from 'lucide-react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { impactEngine } from '../../system/impactEngine';
import { Button } from '../../components/ui';
import { web3Bridge } from '../../web3/web3Provider';
import TransactionStatusBadge, { TransactionStatus } from '../../components/TransactionStatusBadge';

interface SupportModalProps {
  project: { id: string; title: string };
  onClose: () => void;
}

export default function SupportModal({ project, onClose }: SupportModalProps) {
  const { token, recordSupportTransaction } = useGuisoCore();
  const [amount, setAmount] = useState(100);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

  const handleSupport = async () => {
    if (amount > token.gsoBalance) return;
    
    setTxStatus('pending');
    const transactionAdapter = web3Bridge.getTransaction();
    const result = await transactionAdapter.sendTransaction(amount, project.title);
    
    if (!result.success) {
      setTxStatus('failed');
      setTimeout(() => setTxStatus('idle'), 3000);
      return;
    }
    
    setTxHash(result.txHash);
    setTxStatus('confirming');
    
    const confirmed = await transactionAdapter.waitForTransaction(result.txHash);
    
    if (confirmed) {
      setTxStatus('confirmed');
      recordSupportTransaction(project.id, project.title, amount, result.txHash);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 5000);
    } else {
      setTxStatus('failed');
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="form"
              exit={{ y: -20, opacity: 0 }}
              className="p-6 md:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-display font-bold">Apoyar Causa</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-guiso-cream p-4 rounded-2xl mb-6 border border-guiso-orange/10">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Proyecto</p>
                <p className="font-display font-bold text-lg text-guiso-dark">{project.title}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row justify-between text-xs md:text-sm font-bold gap-1">
                  <span>Cantidad GSO</span>
                  <span className={amount > token.gsoBalance ? "text-red-500" : "text-guiso-orange"}>
                    Balance: {token.gsoBalance.toLocaleString()} GSO
                  </span>
                </div>
                
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl md:text-2xl font-display font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">GSO</div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 500, 1000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className="py-2 bg-gray-50 hover:bg-guiso-orange/10 rounded-xl text-xs font-bold transition-colors"
                    >
                      {val}
                    </button>
                  ))}
                </div>
                
                {amount > token.gsoBalance && (
                  <p className="text-red-500 text-xs font-bold text-center mt-2">
                    Necesitás GUISO Tokens para generar impacto.
                  </p>
                )}
              </div>

              <Button 
                onClick={handleSupport}
                disabled={amount <= 0 || amount > token.gsoBalance || txStatus === 'pending' || txStatus === 'confirming'}
                size="lg"
                className="w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {txStatus === 'pending' || txStatus === 'confirming' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Heart size={20} />
                    Confirmar Apoyo
                  </>
                )}
              </Button>
              <TransactionStatusBadge status={txStatus} txHash={txHash} />
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 md:p-12 text-center space-y-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={40} className="animate-pulse md:w-12 md:h-12" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-guiso-dark mb-2">¡Impacto Generado!</h3>
                <p className="text-guiso-orange font-bold text-xs md:text-sm mb-2 italic">"{impactEngine.getRandomMotivation()}"</p>
                <p className="text-gray-500 text-sm md:text-base">Has aportado {amount} GSO a esta causa. Tus puntos de impacto han sido actualizados.</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="px-4 py-2 bg-guiso-orange/10 text-guiso-orange rounded-full text-xs md:text-sm font-bold">
                  +{impactEngine.calculateImpactPoints(amount)} Impact Points
                </div>
                {txHash && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 w-full">
                    <p className="text-xs text-gray-500 font-bold mb-1">Transaction Hash</p>
                    <a 
                      href={`https://testnet.bscscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-guiso-orange hover:underline break-all"
                    >
                      {txHash}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
