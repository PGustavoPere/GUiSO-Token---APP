import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Button } from './ui';

export default function LevelUpNotification() {
  const { levelUpNotification, dismissNotification } = useGuisoCore();

  return (
    <AnimatePresence>
      {levelUpNotification && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-guiso-orange/10 to-transparent pointer-events-none" />
            
            <div className="p-8 md:p-10 text-center relative z-10">
              <button 
                onClick={dismissNotification}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <motion.div
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="w-24 h-24 bg-guiso-orange rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-guiso-orange/30"
              >
                <Trophy size={48} />
              </motion.div>

              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-guiso-orange mb-2">¡Nuevo Nivel Alcanzado!</h2>
              <h3 className="text-3xl font-display font-bold text-guiso-dark mb-4">
                {levelUpNotification.level}
              </h3>
              
              <p className="text-gray-500 mb-8 leading-relaxed">
                {levelUpNotification.message}
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={dismissNotification}
                  size="lg"
                  className="w-full"
                >
                  Continuar Impacto
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-guiso-orange font-bold">
                  <Sparkles size={14} />
                  <span>Tu impacto es imparable</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
