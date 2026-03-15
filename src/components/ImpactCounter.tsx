import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'motion/react';
import { Heart, Users, Utensils, Sparkles } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';

interface CounterProps {
  value: number;
  label: string;
  icon: React.ElementType;
  suffix?: string;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 2,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};

export default function ImpactCounter() {
  const { global } = useGuisoCore();

  const stats = [
    { 
      label: 'Impacto Global', 
      value: global.totalImpact, 
      icon: Sparkles, 
      suffix: ' IP',
      color: 'text-guiso-orange'
    },
    { 
      label: 'Comidas Provistas', 
      value: Math.floor(global.totalImpact / 5), // Symbolic derived value
      icon: Utensils, 
      suffix: '',
      color: 'text-guiso-terracotta'
    },
    { 
      label: 'Causas Apoyadas', 
      value: global.supportedCauses, 
      icon: Heart, 
      suffix: '',
      color: 'text-red-500'
    },
    { 
      label: 'Miembros Activos', 
      value: global.communityMembers, 
      icon: Users, 
      suffix: '',
      color: 'text-blue-500'
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-guiso-dark p-8 md:p-12 text-white shadow-2xl">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-guiso-orange/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-guiso-terracotta/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Impacto Comunitario Global</h2>
          <p className="text-white/60 max-w-xl">Cada acción cuenta. Juntos estamos construyendo un ecosistema donde la transparencia alimenta el impacto real.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={18} className={stat.color} />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl md:text-4xl font-display font-bold flex items-baseline gap-1">
                <AnimatedNumber value={stat.value} />
                {stat.suffix && <span className="text-sm md:text-lg text-white/40">{stat.suffix}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-tighter text-white/30">Live Stats</span>
      </div>
    </div>
  );
}
