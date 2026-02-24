import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Utensils, Home, Sparkles, Coins, Wallet } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { useWallet } from '../core/WalletProvider';
import { impactEngine } from '../system/impactEngine';
import ImpactStoryCard from './ImpactStoryCard';

const CAUSES = [
  { id: 'kitchen', title: 'Comedor Comunitario', icon: Utensils, description: 'Provee comidas calientes a familias en riesgo.' },
  { id: 'homeless', title: 'Apoyo a Personas sin Hogar', icon: Home, description: 'Kits de higiene y refugio temporal.' },
  { id: 'food', title: 'Programa Alimentario Infantil', icon: Heart, description: 'Nutrición básica para niños en edad escolar.' },
];

export default function ImpactTransactionPanel() {
  const { token, supportCause, user } = useGuisoCore();
  const { connect, isConnecting } = useWallet();
  const [selectedCause, setSelectedCause] = useState(CAUSES[0]);
  const [amount, setAmount] = useState(100);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showStory, setShowStory] = useState(false);

  const handleSupport = () => {
    if (amount > token.gsoBalance) return;
    supportCause(selectedCause.id, selectedCause.title, amount);
    setIsSuccess(true);
    
    // Show story after success if in demo mode
    if (user.isDemoModeActive) {
      setTimeout(() => setShowStory(true), 1000);
    }
    
    setTimeout(() => setIsSuccess(false), 3000);
  };

  if (isSuccess) {
    return (
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-8 text-center space-y-4 border-green-100 bg-green-50/30"
        >
          <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-display font-bold text-guiso-dark">¡Impacto Generado!</h3>
          <p className="text-sm text-gray-500">Has aportado {amount} GSO a {selectedCause.title}.</p>
          <div className="inline-block px-4 py-2 bg-guiso-orange/10 text-guiso-orange rounded-full text-xs font-bold">
            +{impactEngine.calculateImpactPoints(amount)} Impact Points
          </div>
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
      <div className="glass-card p-12 text-center space-y-6 border-dashed border-2 border-guiso-orange/20">
        <div className="w-20 h-20 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange">
          <Wallet size={40} />
        </div>
        <div className="max-w-xs mx-auto">
          <h3 className="text-xl font-display font-bold mb-2">Conecta tu Wallet</h3>
          <p className="text-gray-500 text-sm">Para empezar a generar impacto social, necesitas conectar tu billetera digital.</p>
        </div>
        <button 
          onClick={connect}
          disabled={isConnecting}
          className="btn-primary px-8 py-3"
        >
          {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold">Generar Impacto</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-guiso-orange/10 rounded-full text-guiso-orange text-xs font-bold">
          <Coins size={14} />
          <span>{token.gsoBalance.toLocaleString()} GSO Disponibles</span>
        </div>
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
        <div className="flex gap-2">
          {[50, 100, 500, 1000].map(val => (
            <button 
              key={val}
              onClick={() => setAmount(val)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                amount === val ? 'bg-guiso-orange text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSupport}
        disabled={amount <= 0 || amount > token.gsoBalance}
        className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-xl shadow-guiso-orange/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
      >
        <Sparkles size={24} />
        Confirmar Impacto Social
      </button>
      
      <p className="text-center text-[10px] text-gray-400">
        Al confirmar, tus tokens se enviarán directamente a la causa seleccionada y recibirás puntos de impacto instantáneos.
      </p>
    </div>
  );
}
