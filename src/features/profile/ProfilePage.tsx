import React, { useState, useEffect } from 'react';
import { api, UserProfile } from '../../services/api';
import { Wallet, Award, History, ExternalLink, ShieldCheck, LogOut, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = () => {
    setIsConnecting(true);
    // Simulate wallet connection delay
    setTimeout(() => {
      const mockAddress = '0x71C7...f6D2';
      setAddress(mockAddress);
      setIsConnecting(false);
    }, 1500);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProfile(null);
  };

  useEffect(() => {
    if (address) {
      api.getUserProfile(address).then(setProfile);
    }
  }, [address]);

  if (!address) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-guiso-orange/10 rounded-3xl flex items-center justify-center text-guiso-orange mb-4">
          <Wallet size={48} />
        </div>
        <h1 className="text-4xl font-display font-bold">Conecta tu Wallet</h1>
        <p className="text-gray-500 max-w-md">Para ver tu balance de GSO y participar en las decisiones de la comunidad, necesitas conectar tu cartera Web3.</p>
        <button 
          onClick={connectWallet}
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
            {address.substring(2, 4).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              {address}
              <ShieldCheck size={20} className="text-blue-500" />
            </h1>
            <p className="text-gray-500 text-sm">Usuario Verificado de GUISO</p>
          </div>
        </div>
        <button 
          onClick={disconnectWallet}
          className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
        >
          <LogOut size={18} />
          Desconectar
        </button>
      </header>

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 bg-guiso-dark text-white relative overflow-hidden">
                <p className="text-white/60 text-sm mb-1 uppercase tracking-widest font-bold">Balance GSO</p>
                <h3 className="text-4xl font-display font-bold mb-4">{profile.balance.toLocaleString()} GSO</h3>
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-guiso-orange rounded-lg text-sm font-bold hover:bg-guiso-terracotta transition-colors">Enviar</button>
                  <button className="flex-1 py-2 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors">Recibir</button>
                </div>
                <Coins size={120} className="absolute -right-10 -bottom-10 text-white/5" />
              </div>

              <div className="glass-card p-8 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1 uppercase tracking-widest font-bold">Puntos de Impacto</p>
                  <h3 className="text-4xl font-display font-bold text-guiso-orange">{profile.impactPoints} IP</h3>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                  <Award size={14} className="text-guiso-orange" />
                  Nivel: Colaborador Activo
                </div>
              </div>
            </div>

            {/* History */}
            <div className="glass-card p-8">
              <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                <History size={20} className="text-guiso-orange" />
                Historial de Participación
              </h3>
              <div className="space-y-4">
                {profile.history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        item.type === 'vote' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                      )}>
                        {item.type === 'vote' ? <Award size={18} /> : <Heart size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {item.type === 'vote' ? `Votó en: ${item.project}` : `Donación: ${item.amount} GSO`}
                        </p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="glass-card p-6 border-guiso-orange/20">
              <h4 className="font-display font-bold mb-4">Próximas Recompensas</h4>
              <div className="space-y-4">
                <div className="p-4 bg-guiso-cream rounded-xl border border-guiso-orange/10 opacity-50">
                  <p className="text-xs font-bold text-guiso-orange uppercase mb-1">Bloqueado</p>
                  <p className="text-sm font-bold">NFT Fundador GUISO</p>
                  <p className="text-xs text-gray-400">Necesitas 500 IP</p>
                </div>
                <div className="p-4 bg-guiso-cream rounded-xl border border-guiso-orange/10">
                  <p className="text-xs font-bold text-green-500 uppercase mb-1">Disponible</p>
                  <p className="text-sm font-bold">Acceso a Votación VIP</p>
                  <p className="text-xs text-gray-400">¡Ya puedes participar!</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-gray-50 border-none">
              <h4 className="font-display font-bold mb-2">Seguridad</h4>
              <p className="text-xs text-gray-500 mb-4">Tu frase semilla nunca es almacenada en nuestros servidores. GUISO es una plataforma non-custodial.</p>
              <button className="text-xs font-bold text-guiso-orange hover:underline">Ver auditoría de seguridad</button>
            </div>
          </div>
        </div>
      )}
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
