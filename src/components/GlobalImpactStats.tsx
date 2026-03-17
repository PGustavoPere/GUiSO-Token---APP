import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Utensils, Users, FileText, Star } from 'lucide-react';
import { Card } from './ui';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { useImpactExplorerStore } from '../features/impactExplorer/ImpactExplorerStore';

export default function GlobalImpactStats() {
  const { global } = useGuisoCore();
  const { events } = useImpactExplorerStore();

  const totals = useMemo(() => {
    // We use the global state from core which already includes base + session impact
    const totalIP = global.totalImpact;
    const eventCount = events.length;
    
    return {
      meals: Math.floor(totalIP / 5),
      people: Math.floor(totalIP / 15),
      certs: global.supportedCauses + eventCount,
      points: totalIP
    };
  }, [global, events.length]);

  const stats = [
    {
      label: 'Comidas financiadas',
      value: totals.meals.toLocaleString(),
      icon: <Utensils className="w-5 h-5" />,
      color: 'bg-orange-50 text-orange-600',
    },
    {
      label: 'Personas ayudadas',
      value: totals.people.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Certificados emitidos',
      value: totals.certs.toLocaleString(),
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Impact Points generados',
      value: totals.points.toLocaleString(),
      icon: <Star className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-display font-bold text-guiso-dark">Impacto del Ecosistema GUISO</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-1 rounded-full">MVP Live Data</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card variant="glass" padding="md" className="h-full border-white/40 hover:border-guiso-orange/20 transition-colors group">
              <div className="flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-display font-bold text-guiso-dark tracking-tight">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mt-1 leading-tight">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
