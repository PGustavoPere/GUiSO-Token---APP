import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Coins, Sparkles } from 'lucide-react';
import { useGuiso } from '../../context/GuisoContext';
import { impactEngine } from '../../system/impactEngine';

interface SupportModalProps {
  project: { id: string; title: string };
  onClose: () => void;
}

export default function SupportModal({ project, onClose }: SupportModalProps) {
  const { balance, supportProject } = useGuiso();
  const [amount, setAmount] = useState(100);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSupport = () => {
    if (amount > balance) return;
    supportProject(project.id, project.title, amount);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div 
              key="form"
              exit={{ y: -20, opacity: 0 }}
              className="p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-display font-bold">Apoyar Causa</h3>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-guiso-cream p-4 rounded-2xl mb-6 border border-guiso-orange/10">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Proyecto</p>
                <p className="font-display font-bold text-lg text-guiso-dark">{project.title}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span>Cantidad GSO</span>
                  <span className={amount > balance ? "text-red-500" : "text-guiso-orange"}>
                    Balance: {balance.toLocaleString()} GSO
                  </span>
                </div>
                
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-display font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">GSO</div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 500, 1000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setAmount(val)}
                      className="py-2 bg-gray-50 hover:bg-guiso-orange/10 rounded-xl text-xs font-bold transition-colors"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSupport}
                disabled={amount <= 0 || amount > balance}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart size={20} />
                Confirmar Apoyo
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-12 text-center space-y-6"
            >
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={48} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-3xl font-display font-bold text-guiso-dark mb-2">¡Impacto Generado!</h3>
                <p className="text-guiso-orange font-bold text-sm mb-2 italic">"{impactEngine.getRandomMotivation()}"</p>
                <p className="text-gray-500">Has aportado {amount} GSO a esta causa. Tus puntos de impacto han sido actualizados.</p>
              </div>
              <div className="flex justify-center gap-2">
                <div className="px-4 py-2 bg-guiso-orange/10 text-guiso-orange rounded-full text-sm font-bold">
                  +{impactEngine.calculateImpactPoints(amount)} Impact Points
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
