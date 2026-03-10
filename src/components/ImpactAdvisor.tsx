import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useGuisoCore } from '../core/GuisoCoreStore';
import { Card, Button } from './ui';

export default function ImpactAdvisor() {
  const { user, token, global } = useGuisoCore();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateAdvice = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Eres el Asesor de Impacto de GUISO, un ecosistema de impacto social basado en blockchain.
        Analiza el perfil del usuario y dale un consejo corto (máximo 2 frases) sobre cómo maximizar su impacto o qué causas apoyar.
        
        Perfil del Usuario:
        - Nivel: ${user.communityLevel}
        - Puntos de Impacto (IP): ${user.impactScore}
        - Balance GSO: ${token.gsoBalance}
        - Transacciones realizadas: ${token.transactions.length}
        
        Estado Global:
        - Impacto Total: ${global.totalImpact} IP
        - Causas apoyadas: ${global.supportedCauses}
        
        Sé motivador, profesional y usa un tono humano. Habla en español.
        Si el usuario tiene pocos puntos, anímalo a empezar con causas de alimentación.
        Si tiene muchos puntos, felicítalo por su liderazgo.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setAdvice(response.text);
    } catch (error) {
      console.error("Error generating advice:", error);
      setAdvice("Tu impacto es la semilla de un futuro mejor. ¡Sigue apoyando causas locales!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="glass" padding="md" rounded="2xl" className="border-guiso-orange/20 bg-gradient-to-br from-white to-guiso-orange/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-guiso-orange/10 rounded-lg flex items-center justify-center text-guiso-orange">
            <Brain size={18} />
          </div>
          <h4 className="font-display font-bold text-sm">Asesor IA</h4>
        </div>
        <button 
          onClick={generateAdvice} 
          disabled={loading}
          className="p-1.5 hover:bg-guiso-orange/10 rounded-lg text-guiso-orange transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!advice ? (
          <motion.div 
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-gray-500 leading-relaxed">
              ¿No sabés por dónde empezar? Mi inteligencia artificial puede analizar tu perfil y darte una recomendación personalizada.
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-[10px] gap-2 py-1.5"
              onClick={generateAdvice}
            >
              <Sparkles size={12} />
              Obtener Consejo
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key="advice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-3 bg-white/50 rounded-xl border border-guiso-orange/10 italic text-xs text-guiso-dark leading-relaxed">
              "{advice}"
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
              <MessageSquare size={10} />
              Generado por Gemini AI
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
