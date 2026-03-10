import React from 'react';
import { motion } from 'motion/react';
import { Award, Trophy, Medal, User } from 'lucide-react';
import { useIdentityStore } from '../features/identity/IdentityStore';
import { Card } from './ui';

export default function Leaderboard() {
  const { identities } = useIdentityStore();

  const sortedIdentities = React.useMemo(() => {
    const realIdentities = Object.values(identities);
    
    // Mock identities to fill the leaderboard
    const mocks = [
      { wallet: '0x1234...5678', totalImpact: 12500, title: 'Leyenda', impactLevel: 5 },
      { wallet: '0xABCD...EFGH', totalImpact: 8400, title: 'Embajador', impactLevel: 4 },
      { wallet: '0x9876...5432', totalImpact: 4200, title: 'Guardián', impactLevel: 3 },
      { wallet: '0xWXYZ...1234', totalImpact: 1800, title: 'Agente GUISO', impactLevel: 2 },
      { wallet: '0x5555...6666', totalImpact: 350, title: 'Aspirante', impactLevel: 1 },
    ];

    const combined = [...realIdentities, ...mocks];
    return (combined as any[]).sort((a, b) => b.totalImpact - a.totalImpact).slice(0, 10);
  }, [identities]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy size={20} className="text-yellow-500" />;
      case 1: return <Medal size={20} className="text-gray-400" />;
      case 2: return <Medal size={20} className="text-amber-600" />;
      default: return <span className="text-xs font-bold text-gray-400">{index + 1}</span>;
    }
  };

  return (
    <Card variant="glass" padding="md" rounded="2xl" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
          <Award size={20} />
        </div>
        <h3 className="text-xl font-display font-bold">Ranking de Impacto</h3>
      </div>

      <div className="space-y-2">
        {sortedIdentities.map((id, idx) => (
          <motion.div
            key={id.wallet}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {getRankIcon(idx)}
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-guiso-dark">
                  {id.wallet.length > 15 ? `${id.wallet.slice(0, 6)}...${id.wallet.slice(-4)}` : id.wallet}
                </p>
                <p className="text-[10px] text-guiso-orange font-bold uppercase tracking-wider">{id.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-display font-bold text-guiso-dark">{id.totalImpact.toLocaleString()} IP</p>
              <p className="text-[10px] text-gray-400 font-bold">Nivel {id.impactLevel}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
