import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Users, ArrowRight } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Button } from './ui';

export default function ImpactMoment() {
  const { activeImpactMoment, dismissImpactMoment, global } = useGuisoCore();

  return (
    <AnimatePresence>
      {activeImpactMoment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden"
        >
          {/* Atmospheric Background */}
          <div className="absolute inset-0 bg-[#0a0502]">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-orange/30 blur-[120px] animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-terracotta/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          <div className="relative z-10 w-full max-w-lg px-6 text-center">
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="space-y-12"
            >
              {/* Icon Cluster */}
              <div className="relative flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-48 h-48 border border-white/5 rounded-full border-dashed" />
                </motion.div>
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  <Heart size={40} className="text-guiso-orange fill-guiso-orange" />
                </div>
              </div>

              <div className="space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
                >
                  Tu Primer Impacto
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/60 text-lg max-w-sm mx-auto leading-relaxed"
                >
                  Has comenzado algo grande. Tu apoyo a <span className="text-white font-semibold">{activeImpactMoment.target}</span> acaba de mejorar la vida de alguien.
                </motion.p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left"
                >
                  <div className="flex items-center gap-2 text-guiso-orange mb-2">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tus Puntos</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-white">
                    +{activeImpactMoment.points} <span className="text-sm font-normal opacity-40">IP</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left"
                >
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Users size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Comunidad</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-white">
                    {global.totalImpact.toLocaleString()} <span className="text-sm font-normal opacity-40">IP</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex justify-center"
              >
                <Button
                  onClick={dismissImpactMoment}
                  size="lg"
                  className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white text-[#0a0502] hover:bg-guiso-orange hover:text-white"
                >
                  Continuar el Camino
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
