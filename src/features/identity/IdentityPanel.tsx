import React from 'react';
import { motion } from 'motion/react';
import { Shield, Award, ArrowUpRight, Activity } from 'lucide-react';
import { useIdentityStore } from './IdentityStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { Card } from '../../components/ui';
export default function IdentityPanel() {
  const { user } = useGuisoCore();
  const { getIdentity } = useIdentityStore();

  // Si no hay wallet, mostramos un estado simplificado o invitamos a conectar
  const identity = getIdentity(user.walletAddress || '0x0000000000000000000000000000000000000000');
  const isConnected = !!user.walletAddress;

  const getNextLevelThreshold = (currentTotal: number) => {
    if (currentTotal < 500) return 500;
    if (currentTotal < 2000) return 2000;
    if (currentTotal < 5000) return 5000;
    if (currentTotal < 10000) return 10000;
    return currentTotal; // Max level
  };

  const nextThreshold = getNextLevelThreshold(identity.totalImpact);
  const progress = identity.totalImpact >= 10000 
    ? 100 
    : (identity.totalImpact / nextThreshold) * 100;

  return (
    <Card variant="glass" padding="lg" className="relative space-y-6 overflow-hidden">
      {!isConnected && (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <Shield className="text-gray-300 mx-auto" size={40} />
            <p className="text-sm font-bold text-gray-500">Conecta tu Wallet para ver tu Identidad de Impacto</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-guiso-dark flex items-center gap-2">
          <Shield className="text-guiso-orange" size={24} />
          Tu Identidad Solidaria
        </h2>
        <div className="px-3 py-1 bg-guiso-orange/10 text-guiso-orange rounded-full text-xs font-bold uppercase tracking-wider">
          Nivel {identity.title}
        </div>
      </div>

      <div className="text-center py-6 border-y border-gray-100">
        <p className="text-sm text-gray-500 font-medium mb-1">Título Actual</p>
        <h3 className="text-3xl font-display font-bold text-guiso-dark">
          {identity.title}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500 font-medium">Impacto Total</p>
            <p className="text-2xl font-bold text-guiso-orange">{identity.totalImpact} IP</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Próximo Nivel</p>
            <p className="text-sm font-bold text-gray-400">{identity.totalImpact >= 10000 ? 'NIVEL MÁXIMO' : `${nextThreshold} IP`}</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-guiso-orange rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pagos Totales</p>
            <p className="font-bold text-gray-900">{identity.totalPayments}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Certificados</p>
            <p className="font-bold text-gray-900">{identity.certificatesEarned}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
