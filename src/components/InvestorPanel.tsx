import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Users, BarChart3, Globe, Zap } from 'lucide-react';

export default function InvestorPanel() {
  const metrics = [
    { label: "Crecimiento Usuarios", value: "+124%", icon: Users, color: "text-green-500" },
    { label: "Volumen Transacciones", value: "2.4M GSO", icon: BarChart3, color: "text-blue-500" },
    { label: "Retención Social", value: "88%", icon: Zap, color: "text-guiso-orange" },
    { label: "Alcance Geográfico", value: "12 Países", icon: Globe, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xl font-display font-bold flex items-center gap-2">
          <TrendingUp size={24} className="text-guiso-orange" />
          Métricas de Crecimiento (Simulación)
        </h3>
        <span className="text-[10px] font-bold bg-guiso-dark text-white px-3 py-1 rounded-full uppercase tracking-widest">
          Investor View
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5 space-y-3 border-guiso-orange/10"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 ${m.color}`}>
              <m.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{m.label}</p>
              <p className="text-2xl font-display font-bold">{m.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-6 bg-guiso-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-guiso-orange/10 blur-[60px]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h4 className="text-lg font-display font-bold">Proyección de Impacto 2026</h4>
            <p className="text-sm text-white/60 max-w-md">
              Basado en el crecimiento actual, GUISO proyecta generar más de <span className="text-guiso-orange font-bold">5 millones de raciones</span> de comida para finales del próximo año.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-guiso-dark rounded-full font-bold text-sm hover:bg-guiso-orange hover:text-white transition-all">
            Descargar Pitch Deck
          </button>
        </div>
      </div>
    </div>
  );
}
