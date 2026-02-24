import React, { useState } from 'react';
import { Wallet, Award, History, ExternalLink, ShieldCheck, LogOut, Heart, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useGuiso } from '../../context/GuisoContext';
import { impactEngine } from '../../system/impactEngine';

export default function ProfilePage() {
  const { 
    balance, 
    impactScore, 
    communityLevel, 
    history, 
    isWalletConnected, 
    connectWallet,
    totalSupportedCauses 
  } = useGuiso();
  const [isConnecting, setIsConnecting] = useState(false);

  const nextThreshold = impactEngine.getNextThreshold(impactScore);
  const currentThreshold = impactEngine.calculateLevel(impactScore);
  
  const progress = nextThreshold 
    ? ((impactScore - currentThreshold.minPoints) / (nextThreshold.minPoints - currentThreshold.minPoints)) * 100 
    : 100;

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      connectWallet();
      setIsConnecting(false);
    }, 1500);
  };

  const address = isWalletConnected ? '0x71C7...f6D2' : null;

  if (!isWalletConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-guiso-orange/10 rounded-3xl flex items-center justify-center text-guiso-orange mb-4">
          <Wallet size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold">Conecta tu Wallet</h1>
        <p className="text-gray-500 max-w-md">Para ver tu balance de GSO y participar en las decisiones de la comunidad, necesitas conectar tu cartera Web3.</p>
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Conectar Wallet
            </>
          )}
        </button>
        <p className="text-xs text-gray-400">Soportamos MetaMask, WalletConnect y Coinbase Wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-guiso-orange to-guiso-terracotta rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {address?.substring(2, 4).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              {address}
              <ShieldCheck size={20} className="text-blue-500" />
            </h1>
            <p className="text-gray-500 text-sm">{communityLevel}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 bg-guiso-dark text-white relative overflow-hidden">
              <p className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Balance GSO</p>
              <h3 className="text-4xl font-display font-bold mb-4">{balance.toLocaleString()} GSO</h3>
              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-guiso-orange rounded-lg text-sm font-bold hover:bg-guiso-terracotta transition-colors">Enviar</button>
                <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">Recibir</button>
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">Puntos de Impacto</p>
                <h3 className="text-4xl font-display font-bold text-guiso-orange">{impactScore} IP</h3>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                <Sparkles size={14} className="text-guiso-orange" />
                Causas Apoyadas: {totalSupportedCauses}
              </div>
            </div>
          </div>

          {/* History */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <History size={20} className="text-guiso-orange" />
              Historial de Acciones Sociales
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((item) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={item.id} 
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-guiso-orange/10 text-guiso-orange flex items-center justify-center">
                        <Heart size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Apoyo a {item.projectTitle}</p>
                        <p className="text-xs text-gray-400">{item.date} • {item.amount} GSO aportados</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-500">+{item.impactGenerated} IP</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>Aún no has realizado ninguna acción social.</p>
                  <p className="text-xs">¡Visita la sección de Impacto para comenzar!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="glass-card p-6 border-guiso-orange/20">
            <h4 className="font-display font-bold mb-4">Progreso de Nivel</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Nivel Actual</span>
                <span className="text-guiso-orange">
                  {impactScore} / {nextThreshold ? nextThreshold.minPoints : 'MAX'} IP
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-guiso-orange h-full transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center italic">
                {nextThreshold ? `Próximo rango: ${nextThreshold.level}` : '¡Has alcanzado el nivel máximo!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function Coins({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82" />
    </svg>
  );
}
