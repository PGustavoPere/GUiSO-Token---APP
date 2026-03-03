import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Utensils, Heart, Users, TrendingUp, Coins, Zap } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Card, Badge } from './ui';

export default function ImpactDashboard() {
  const { global, user, token } = useGuisoCore();

  const meals = Math.floor(global.totalImpact / 5);
  const communityIndex = Math.min(100, (global.communityMembers / 1000) * 100);

  const stats = [
    { 
      label: 'GUISO Balance', 
      value: token.gsoBalance, 
      icon: Coins, 
      color: 'bg-yellow-50 text-yellow-500',
      suffix: ' GSO'
    },
    { 
      label: 'Impact Power', 
      value: token.impactPower, 
      icon: Zap, 
      color: 'bg-blue-50 text-blue-500',
      suffix: ' IP'
    },
    { 
      label: 'Lifetime Impact', 
      value: user.impactScore, 
      icon: Sparkles, 
      color: 'bg-guiso-orange/10 text-guiso-orange',
      suffix: ' IP'
    },
    { 
      label: 'Comidas Generadas', 
      value: meals, 
      icon: Utensils, 
      color: 'bg-guiso-terracotta/10 text-guiso-terracotta',
      suffix: ''
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card variant="glass" padding="sm" rounded="2xl" className="space-y-3 h-full">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{stat.label}</p>
                <p className="text-2xl font-display font-bold">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  <span className="text-sm font-normal opacity-40">{stat.suffix}</span>
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Visual Progress Section */}
      <Card variant="glass" padding="lg" rounded="2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-display font-bold">Token Influence</h3>
              <Badge variant="primary">{token.influenceBadge}</Badge>
            </div>
            <p className="text-sm text-gray-500 max-w-sm">
              Tu nivel de influencia en la comunidad está determinado por tu balance de tokens GUISO.
            </p>
          </div>
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span>Progreso Meta</span>
              <span className="text-guiso-orange">{communityIndex.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${communityIndex}%` }}
                className="bg-guiso-orange h-full"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
