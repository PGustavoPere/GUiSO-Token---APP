import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Info, X, ArrowRight } from 'lucide-react';

interface ImpactStoryCardProps {
  isOpen: boolean;
  onClose: () => void;
  target: string;
}

export default function ImpactStoryCard({ isOpen, onClose, target }: ImpactStoryCardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[2rem] md:rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 bg-white/50 backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            <div className="relative h-40 md:h-48">
              <img
                src={`https://picsum.photos/seed/${target}/800/400`}
                alt="Impact Story"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
              <div className="absolute bottom-4 left-6 md:bottom-6 md:left-8">
                <div className="bg-guiso-orange text-white px-3 py-1 md:px-4 md:py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                  Historia de Impacto
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-guiso-dark">El Efecto GUISO</h3>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 bg-guiso-orange/10 rounded-2xl flex items-center justify-center text-guiso-orange shrink-0">
                  <Info size={24} />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Esta transacción simulada representa cómo las finanzas descentralizadas pueden sostener <span className="text-guiso-dark font-bold">{target}</span> de forma real.
                  </p>
                  <p className="text-gray-500 text-sm italic">
                    "En el modelo GUISO, el valor no se queda atrapado en el protocolo; fluye directamente hacia donde más se requiere, validado por el ecosistema."
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-guiso-dark text-white rounded-2xl font-bold hover:bg-guiso-orange transition-all group"
                >
                  Entendido
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
