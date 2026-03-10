import React from 'react';
import { motion } from 'motion/react';
import { Coins, Utensils, ArrowUpRight, Shield } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Card, Badge } from './ui';
import { Link } from 'react-router-dom';

export default function ImpactDashboard() {
  const { global, user, token } = useGuisoCore();

  const meals = Math.floor(global.totalImpact / 5);
  const communityIndex = Math.min(100, (global.communityMembers / 1000) * 100);

  const stats = [
    { 
      label: 'Tu Balance', 
      value: token.gsoBalance, 
      icon: Coins, 
      color: 'bg-yellow-50 text-yellow-500',
      suffix: ' GSO'
    },
    { 
      label: 'Ayuda Entregada', 
      value: meals, 
      icon: Utensils, 
      color: 'bg-guiso-terracotta/10 text-guiso-terracotta',
      suffix: ' Comidas'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card variant="glass" padding="md" rounded="2xl" className="space-y-3 h-full">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{stat.label}</p>
                <p className="text-3xl font-display font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  <span className="text-sm font-normal opacity-40 ml-1">{stat.suffix}</span>
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Minimal Personal Impact Summary */}
      <Link to="/perfil">
        <Card variant="glass" padding="sm" rounded="2xl" className="mt-4 border-guiso-orange/10 hover:border-guiso-orange/30 transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tu Compromiso</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-guiso-dark">{user.impactScore} Puntos de Ayuda</span>
                  <Badge variant="primary" size="sm">{user.communityLevel}</Badge>
                </div>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-gray-300 group-hover:text-guiso-orange transition-colors" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
