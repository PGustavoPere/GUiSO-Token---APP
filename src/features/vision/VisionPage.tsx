import React from 'react';
import { motion } from 'motion/react';
import { Globe, ShieldCheck, Zap, Heart, ArrowRight, Layers, Cpu, Users } from 'lucide-react';

export default function VisionPage() {
  const pillars = [
    {
      icon: Globe,
      title: "Neutralidad Humanitaria",
      desc: "GUISO no tiene agenda política. Nuestro único objetivo es optimizar la distribución de recursos hacia causas sociales verificadas."
    },
    {
      icon: ShieldCheck,
      title: "Transparencia Radical",
      desc: "Cada ración de comida, cada kit de higiene, cada acción social es rastreable desde el origen hasta el destino final."
    },
    {
      icon: Zap,
      title: "Eficiencia Web3",
      desc: "Eliminamos intermediarios innecesarios, reduciendo costos operativos y asegurando que el valor llegue intacto a la comunidad."
    }
  ];

  const roadmap = [
    { phase: "Fase 1: MVP", status: "Completado", desc: "Simulación de economía de impacto y validación de UX." },
    { phase: "Fase 2: Protocolo", status: "En progreso", desc: "Despliegue de Smart Contracts en Testnet y gobernanza inicial." },
    { phase: "Fase 3: Oráculos", status: "Q3 2026", desc: "Integración de datos del mundo real para validación de impacto." },
    { phase: "Fase 4: Escala", status: "2027", desc: "Expansión global y red de partners humanitarios descentralizada." }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-guiso-orange/10 text-guiso-orange text-xs font-bold uppercase tracking-widest"
        >
          <Layers size={14} />
          Nuestra Visión 2026
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-bold tracking-tight max-w-4xl mx-auto"
        >
          Redefiniendo el <span className="text-guiso-orange">Valor Social</span> en la Era Digital.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          GUISO no es solo un token; es un protocolo de confianza diseñado para escalar la generosidad humana mediante tecnología inmutable.
        </motion.p>
      </section>

      {/* Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 space-y-4 hover:border-guiso-orange/30 transition-all"
          >
            <div className="w-12 h-12 bg-guiso-orange/10 rounded-2xl flex items-center justify-center text-guiso-orange">
              <p.icon size={24} />
            </div>
            <h3 className="text-xl font-display font-bold">{p.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Impact Loop Explanation */}
      <section className="glass-card p-8 md:p-16 bg-guiso-dark text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-guiso-orange/10 blur-[120px]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-4xl font-display font-bold">El Impact Loop</h2>
            <p className="text-white/60 leading-relaxed">
              Nuestro sistema crea un ciclo virtuoso donde la actividad económica alimenta directamente el bienestar social, y el bienestar social fortalece la legitimidad del protocolo.
            </p>
            <div className="space-y-4">
              {[
                { icon: Cpu, text: "Transacción genera señal de impacto." },
                { icon: Users, text: "Comunidad valida el resultado." },
                { icon: Heart, text: "Protocolo recompensa la participación." }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-guiso-orange">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-square flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-white/5 rounded-full border-dashed"
            />
            <div className="w-32 h-32 bg-guiso-orange rounded-3xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-guiso-orange/40">
              G
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="space-y-8">
        <h2 className="text-3xl font-display font-bold text-center">Hoja de Ruta</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {roadmap.map((r, i) => (
            <div key={r.phase} className="glass-card p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-guiso-orange">{r.phase}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${r.status === 'Completado' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {r.status}
                </span>
              </div>
              <h4 className="font-bold text-sm">{r.desc}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center p-12 bg-guiso-cream rounded-[3rem] space-y-6">
        <h3 className="text-3xl font-display font-bold">¿Listo para ser parte del cambio?</h3>
        <p className="text-gray-500 max-w-md mx-auto">Únete a nuestra comunidad de inversores y partners humanitarios.</p>
        <button className="btn-primary px-10 py-4 text-lg flex items-center gap-2 mx-auto">
          Contactar con el Equipo
          <ArrowRight size={20} />
        </button>
      </section>
    </div>
  );
}
