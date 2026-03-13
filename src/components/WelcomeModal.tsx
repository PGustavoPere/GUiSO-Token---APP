import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Heart, Link as LinkIcon, FileCheck, Star, Users, X } from 'lucide-react';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('guiso_welcome_seen');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('guiso_welcome_seen', 'true');
    setIsOpen(false);
  };

  const steps = [
    { icon: <User className="w-5 h-5 text-emerald-500" />, text: "1️⃣ Usuario: Conectas tu identidad digital" },
    { icon: <Heart className="w-5 h-5 text-rose-500" />, text: "2️⃣ Contribución: Apoyas una iniciativa social" },
    { icon: <LinkIcon className="w-5 h-5 text-indigo-500" />, text: "3️⃣ Impacto verificado: Se registra en la blockchain" },
    { icon: <FileCheck className="w-5 h-5 text-amber-500" />, text: "4️⃣ Certificado: Recibes un comprobante inmutable" },
    { icon: <Star className="w-5 h-5 text-purple-500" />, text: "5️⃣ Reputación: Tu nivel de impacto (IP) crece" },
    { icon: <Users className="w-5 h-5 text-cyan-500" />, text: "6️⃣ Comunidad: Decidimos juntos el futuro" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl scrollbar-hide"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-2 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Bienvenido a GUISO</h2>
              <p className="mt-1 text-sm text-slate-500">Así funciona nuestro ecosistema:</p>
            </div>

            {/* Content */}
            <div className="px-5 py-2 space-y-2">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="flex items-center p-2.5 space-x-3 transition-colors rounded-xl bg-slate-50 hover:bg-slate-100"
                >
                  <div className="flex-shrink-0 p-1.5 bg-white rounded-lg shadow-sm">
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-700 leading-snug">{step.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 mt-2 bg-slate-50/50 border-t border-slate-100">
              <p className="mb-4 text-[10px] text-center text-slate-400 leading-relaxed">
                GUISO utiliza tecnología blockchain para registrar impacto social de forma transparente y segura.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3.5 text-sm font-bold text-white transition-all shadow-lg rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-200"
              >
                Comenzar
              </button>
            </div>

            {/* Close button (optional, but good for UX) */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-slate-400 transition-colors rounded-full hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
