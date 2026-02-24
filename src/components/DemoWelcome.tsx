import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Button } from './ui';

export default function DemoWelcome() {
  const { user, startDemo, skipDemo } = useGuisoCore();

  console.log("Demo state (hasSeenWelcome):", user.hasSeenWelcome);

  return (
    <AnimatePresence>
      {!user.hasSeenWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center bg-guiso-dark/90 backdrop-blur-xl p-6 overflow-y-auto"
        >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-orange/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-terracotta/10 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8 md:space-y-12 py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-guiso-orange rounded-3xl flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-2xl shadow-guiso-orange/40">
              G
            </div>
          </motion.div>

          <div className="space-y-4 md:space-y-6">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-7xl font-display font-bold text-white leading-tight"
            >
              Bienvenido a <br />
              <span className="text-guiso-orange">GUISO Token</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-white/60 max-w-lg mx-auto leading-relaxed"
            >
              GUISO transforma cada transacción financiera en un impacto humanitario medible y transparente.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="hidden md:grid grid-cols-3 gap-6 text-left"
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
            className="flex flex-col md:flex-row items-center justify-center gap-4 px-4"
          >
            <Button
              onClick={() => {
                console.log("Start Experience clicked");
                startDemo();
              }}
              size="lg"
              className="w-full md:w-auto px-8 md:px-10 py-4 bg-white text-guiso-dark hover:bg-guiso-orange hover:text-white flex items-center justify-center gap-2 group shadow-xl"
            >
              Start Experience
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => {
                console.log("Explore App Freely clicked");
                skipDemo();
              }}
              variant="outline"
              size="lg"
              className="w-full md:w-auto px-8 md:px-10 py-4 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
            >
              Explore App Freely
            </Button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-[10px] text-white/20 uppercase tracking-widest"
          >
            Social Impact MVP v1.0
          </motion.p>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
