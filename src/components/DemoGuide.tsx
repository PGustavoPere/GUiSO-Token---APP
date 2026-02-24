import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Info, X } from 'lucide-react';
import { useGuisoCore } from '../core/GuisoCoreStore';

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
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[400] w-full max-w-md px-6"
      >
        <div className="bg-guiso-dark border border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-black/50 relative overflow-hidden">
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

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-guiso-orange/20 rounded-2xl flex items-center justify-center text-guiso-orange shrink-0">
              <Info size={24} />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-display font-bold text-lg">{currentStep.title}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{currentStep.content}</p>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                  Paso {user.demoStep} de {STEPS.length}
                </span>
                <button
                  onClick={nextDemoStep}
                  className="flex items-center gap-2 px-6 py-2 bg-guiso-orange text-white rounded-full font-bold text-sm hover:bg-guiso-terracotta transition-all group"
                >
                  {user.demoStep === STEPS.length ? 'Finalizar' : 'Siguiente'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
