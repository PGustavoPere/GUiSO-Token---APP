import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';

export default function DemoWelcome() {
  const { user, startDemo, skipDemo } = useGuisoCore();

  if (user.hasSeenWelcome) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[500] flex items-center justify-center bg-guiso-dark p-6"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-orange/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-terracotta/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-guiso-orange rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-guiso-orange/40">
              G
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-display font-bold text-white leading-tight"
            >
              Bienvenido a <br />
              <span className="text-guiso-orange">GUISO Token</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              GUISO transforma cada transacción financiera en un impacto humanitario medible y transparente.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            {[
              { icon: Globe, title: "Visión Global", desc: "Escalabilidad humanitaria." },
              { icon: ShieldCheck, title: "Transparencia", desc: "Impacto verificado." },
              { icon: Sparkles, title: "Incentivos", desc: "Proof of Impact." },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <item.icon className="text-guiso-orange mb-2" size={20} />
                <h4 className="text-white font-bold text-sm">{item.title}</h4>
                <p className="text-white/40 text-[10px]">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={startDemo}
              className="w-full md:w-auto px-10 py-4 bg-white text-guiso-dark rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-guiso-orange hover:text-white transition-all group"
            >
              Iniciar Experiencia Guiada
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={skipDemo}
              className="w-full md:w-auto px-10 py-4 bg-white/5 text-white/60 rounded-full font-bold text-lg hover:bg-white/10 hover:text-white transition-all"
            >
              Explorar Libremente
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
