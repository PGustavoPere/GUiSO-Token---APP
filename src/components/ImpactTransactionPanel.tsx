import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Utensils, Home, Sparkles, Coins, Wallet } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { useWallet } from '../core/WalletProvider';
import { impactEngine } from '../system/impactEngine';
import ImpactStoryCard from './ImpactStoryCard';
import { Card, Button, Badge } from './ui';
import { web3Bridge } from '../web3/web3Provider';
import TransactionStatusBadge, { TransactionStatus } from './TransactionStatusBadge';
import { useTranslation } from '../i18n';

const CAUSES = [
  { id: 'kitchen', title: 'Comedor Comunitario', icon: Utensils, description: 'Provee comidas calientes a familias en riesgo.' },
  { id: 'homeless', title: 'Apoyo a Personas sin Hogar', icon: Home, description: 'Kits de higiene y refugio temporal.' },
  { id: 'food', title: 'Programa Alimentario Infantil', icon: Heart, description: 'Nutrición básica para niños en edad escolar.' },
];

export default function ImpactTransactionPanel() {
  const { token, recordSupportTransaction, user } = useGuisoCore();
  const { connect, isConnecting } = useWallet();
  const { t } = useTranslation();
  const [selectedCause, setSelectedCause] = useState(CAUSES[0]);
  const [amount, setAmount] = useState(100);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

  const handleSupport = async () => {
    if (amount > token.gsoBalance) return;
    
    setTxStatus('pending');
    const transactionAdapter = web3Bridge.getTransaction();
    const result = await transactionAdapter.sendTransaction(amount, selectedCause.title);
    
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
      recordSupportTransaction(selectedCause.id, selectedCause.title, amount, result.txHash);
      setIsSuccess(true);
      
      // Show story after success if in demo mode
      if (user.isDemoModeActive) {
        setTimeout(() => setShowStory(true), 1000);
      }
      
      setTimeout(() => {
        setIsSuccess(false);
        setTxHash(null);
        setTxStatus('idle');
      }, 5000);
    } else {
      setTxStatus('failed');
      setTimeout(() => setTxStatus('idle'), 3000);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card variant="glass" padding="lg" className="text-center space-y-4 border-green-100 bg-green-50/30">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-display font-bold text-guiso-dark">¡Impacto Generado!</h3>
            <p className="text-sm text-gray-500">Has aportado {amount} GSO a {selectedCause.title}.</p>
            <Badge variant="success">
              +{impactEngine.calculateImpactPoints(amount)} {t('impact.impactPoints')}
            </Badge>
            {txHash && (
              <div className="mt-4 p-3 bg-white/50 rounded-xl border border-green-200">
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
          </Card>
        </motion.div>
        
        <ImpactStoryCard 
          isOpen={showStory} 
          onClose={() => setShowStory(false)} 
          target={selectedCause.title} 
        />
      </div>
    );
  }

  if (!user.isWalletConnected) {
    return (
      <Card variant="glass" padding="xl" className="text-center space-y-6 border-dashed border-2 border-guiso-orange/20">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange">
          <Wallet size={32} className="md:w-10 md:h-10" />
        </div>
        <div className="max-w-xs mx-auto">
          <h3 className="text-xl font-display font-bold mb-2">{t('navigation.connectWallet')}</h3>
          <p className="text-gray-500 text-sm">Para empezar a generar impacto social, necesitas conectar tu billetera digital.</p>
        </div>
        <Button 
          onClick={connect}
          disabled={isConnecting}
          className="w-full sm:w-auto px-8 py-3"
        >
          {isConnecting ? t('common.loading') : t('navigation.connectWallet')}
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="md" className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-display font-bold">{t('impact.quickAction')}</h3>
        <Badge variant="primary" className="w-full sm:w-auto justify-center gap-2">
          <Coins size={14} />
          <span>{token.gsoBalance.toLocaleString()} GSO Disponibles</span>
        </Badge>
      </div>

      {/* Cause Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAUSES.map((cause) => (
          <button
            key={cause.id}
            onClick={() => setSelectedCause(cause)}
            className={`p-4 rounded-2xl border-2 transition-all text-left space-y-3 ${
              selectedCause.id === cause.id 
                ? 'border-guiso-orange bg-guiso-orange/5 shadow-md' 
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selectedCause.id === cause.id ? 'bg-guiso-orange text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              <cause.icon size={20} />
            </div>
            <div>
              <p className="font-bold text-sm">{cause.title}</p>
              <p className="text-[10px] text-gray-400 line-clamp-2">{cause.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Amount Selection */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-gray-600">Cantidad a Aportar</label>
          <span className="text-xs text-gray-400">100 GSO ≈ 20 Comidas</span>
        </div>
        <div className="relative">
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-3xl font-display font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">GSO</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[50, 100, 500, 1000].map(val => (
            <button 
              key={val}
              onClick={() => setAmount(val)}
              className={`flex-1 min-w-[60px] px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                amount === val ? 'bg-guiso-orange text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
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
        className="w-full flex items-center justify-center gap-3 shadow-xl shadow-guiso-orange/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
      >
        {txStatus === 'pending' || txStatus === 'confirming' ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t('payments.processing')}
          </>
        ) : (
          <>
            <Sparkles size={20} className="md:w-6 md:h-6" />
            {t('impact.supportCause')}
          </>
        )}
      </Button>
      
      <TransactionStatusBadge status={txStatus} txHash={txHash} />
      
      <p className="text-center text-[10px] text-gray-400">
        Al confirmar, tus tokens se enviarán directamente a la causa seleccionada y recibirás puntos de impacto instantáneos.
      </p>
    </Card>
  );
}
