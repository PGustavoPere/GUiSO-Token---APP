import React, { useState } from 'react';
import { Wallet, Award, History, ExternalLink, ShieldCheck, LogOut, Heart, Sparkles, User, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useWallet } from '../../core/WalletProvider';
import { impactEngine } from '../../system/impactEngine';
import { Card, Button, Badge } from '../../components/ui';
import { ActivityTimeline } from '../../components/ActivityTimeline';

export default function ProfilePage() {
  const { 
    user,
    token,
    global
  } = useGuisoCore();
  const { address, isConnected, connect, isConnecting } = useWallet();

  const impactScore = user.impactScore;
  const communityLevel = user.communityLevel;
  const isWalletConnected = isConnected;
  const balance = token.gsoBalance;
  const history = token.transactions;
  const totalSupportedCauses = global.supportedCauses;

  const nextThreshold = impactEngine.getNextThreshold(impactScore);
  const currentThreshold = impactEngine.calculateLevel(impactScore);
  
  const progress = nextThreshold 
    ? ((impactScore - currentThreshold.minPoints) / (nextThreshold.minPoints - currentThreshold.minPoints)) * 100 
    : 100;

  const handleConnect = () => {
    connect();
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-guiso-orange/10 rounded-3xl flex items-center justify-center text-guiso-orange mb-4">
          <Wallet size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold">Conecta tu Wallet</h1>
        <p className="text-gray-500 max-w-md">Para ver tu balance de GSO y participar en la validación del ecosistema, necesitas conectar tu cartera Web3.</p>
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          size="lg"
          className="flex items-center gap-2 px-10"
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
        </Button>
        <p className="text-xs text-gray-400">Soportamos MetaMask, WalletConnect y Coinbase Wallet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-guiso-orange to-guiso-terracotta rounded-3xl flex items-center justify-center text-white text-2xl md:text-4xl font-bold shrink-0 overflow-hidden shadow-xl border-4 border-white">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                address?.substring(2, 4).toUpperCase() || 'G'
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md text-gray-400 hover:text-guiso-orange transition-colors border border-gray-100">
              <Edit2 size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-bold truncate">
                {user.username}
              </h1>
              <ShieldCheck size={20} className="text-blue-500 shrink-0" />
            </div>
            <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">{communityLevel}</p>
            <p className="text-gray-400 text-xs md:text-sm max-w-md italic">
              {user.bio}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-[10px] md:text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card variant="dark" padding="md" rounded="2xl" className="relative overflow-hidden">
              <p className="text-white/60 text-xs md:text-sm mb-1 uppercase tracking-widest font-bold">Balance GSO</p>
              <h3 className="text-3xl md:text-4xl font-display font-bold mb-4">{balance.toLocaleString()} GSO</h3>
              <div className="flex gap-2 md:gap-3">
                <Button variant="primary" size="sm" className="flex-1">Enviar</Button>
                <Button variant="secondary" size="sm" className="flex-1">Recibir</Button>
              </div>
            </Card>

            <Card variant="glass" padding="md" rounded="2xl" className="flex flex-col justify-between">
              <div>
                <p className="text-gray-500 text-xs md:text-sm mb-1 uppercase tracking-widest font-bold">Puntos de Impacto</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-guiso-orange">{impactScore} IP</h3>
              </div>
              <div className="mt-4 md:mt-6 flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                <Sparkles size={14} className="text-guiso-orange" />
                Causas Apoyadas: {totalSupportedCauses}
              </div>
            </Card>
          </div>

          {/* History */}
          <Card variant="glass" padding="md" rounded="2xl" className="border-t-4 border-t-guiso-orange">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg md:text-xl font-display font-bold flex items-center gap-2">
                <History size={20} className="text-guiso-orange" />
                Tu Historia de Impacto
              </h3>
              <Badge variant="neutral" className="text-[10px] uppercase tracking-widest">
                Blockchain Verificada
              </Badge>
            </div>
            
            <ActivityTimeline activities={history} />
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card variant="glass" padding="sm" rounded="2xl" className="border-guiso-orange/20">
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
          </Card>
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
