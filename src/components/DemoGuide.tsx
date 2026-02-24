import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Info, X } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Button } from './ui';

const STEPS = [
  {
    step: 1,
    title: "Bienvenido al Ecosistema",
    content: "Este es tu centro de mando. Aquí verás el impacto que generas y las métricas de la comunidad.",
    position: "bottom-right"
  },
  {
    step: 2,
    title: "Conecta tu Wallet",
    content: "Para interactuar con el protocolo, necesitas una identidad digital. Simula una conexión para continuar.",
    target: "wallet-section"
  },
  {
    step: 3,
    title: "Genera tu Primer Impacto",
    content: "Elige una causa y envía tokens GSO. Observa cómo se transforman en ayuda real.",
    target: "transaction-panel"
  },
  {
    step: 4,
    title: "Métricas de Impacto",
    content: "Observa cómo tus acciones mueven las agujas globales. Cada comida cuenta.",
    target: "dashboard-stats"
  },
  {
    step: 5,
    title: "Visión de Escalabilidad",
    content: "Descubre cómo GUISO planea escalar este modelo a nivel global en la sección de Visión.",
    target: "vision-nav"
  }
];

export default function DemoGuide() {
  const { user, nextDemoStep, skipDemo } = useGuisoCore();

  if (!user.isDemoModeActive) return null;

  const currentStep = STEPS.find(s => s.step === user.demoStep);
  if (!currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-4 md:px-6"
      >
        <div className="bg-guiso-dark border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-2xl shadow-black/50 relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(user.demoStep / STEPS.length) * 100}%` }}
              className="h-full bg-guiso-orange"
            />
          </div>

          <button
            onClick={skipDemo}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-guiso-orange/20 rounded-xl md:rounded-2xl flex items-center justify-center text-guiso-orange shrink-0">
              <Info size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="space-y-3 md:space-y-4">
              <div>
                <h4 className="text-white font-display font-bold text-base md:text-lg">{currentStep.title}</h4>
                <p className="text-white/60 text-xs md:text-sm leading-relaxed">{currentStep.content}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-[8px] md:text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  Paso {user.demoStep} de {STEPS.length}
                </span>
                <Button
                  onClick={nextDemoStep}
                  size="sm"
                  className="flex items-center gap-2 px-4 md:px-6 py-2 group"
                >
                  {user.demoStep === STEPS.length ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
