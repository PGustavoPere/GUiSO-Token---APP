import React from 'react';
import { motion } from 'motion/react';
import { History, Heart, ExternalLink, Calendar, Hash } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Card } from './ui';
export default function ImpactHistory() {
  const { token } = useGuisoCore();

  if (token.transactions.length === 0) {
    return (
      <Card variant="glass" padding="lg" className="text-center space-y-4 border-dashed border-2 border-guiso-orange/20">
        <div className="w-16 h-16 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange">
          <History size={32} />
        </div>
        <p className="text-gray-500 text-sm italic font-medium">Aún no has realizado ninguna acción de impacto.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-lg font-display font-bold flex items-center gap-2">
          <History size={20} className="text-guiso-orange" />
          Historial de Impacto
        </h3>
        <span className="text-xs text-gray-400">{token.transactions.length} Acciones</span>
      </div>

      <div className="space-y-3">
        {token.transactions.map((tx, idx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card variant="glass" padding="sm" className="hover:border-guiso-orange/30 transition-all group">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-guiso-orange/10 rounded-2xl flex items-center justify-center text-guiso-orange shrink-0">
                    <Heart size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-guiso-dark">Apoyo a {tx.target}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {tx.date}</span>
                      <span className="flex items-center gap-1"><Hash size={12} /> ID: {tx.id}</span>
                      {tx.txHash && (
                        <span className="flex items-center gap-1 text-guiso-orange/60">
                          <ExternalLink size={12} /> {tx.txHash}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col justify-between md:items-end gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-display font-bold text-guiso-orange">-{tx.amount} GSO</p>
                    <p className="text-[10px] text-green-500 font-bold">+{tx.impactPoints} Impact Points</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
