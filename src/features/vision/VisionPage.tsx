import React from 'react';
import { motion } from 'motion/react';
import { 
  Target, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Globe, 
  Heart, 
  Layers, 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  Link, 
  Info, 
  Sparkles,
  CreditCard,
  Vote,
  FileCheck
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';

export default function VisionPage() {
  return (
    <div className="space-y-24 pb-24">
      {/* SECCIÓN 1 — HERO */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-guiso-orange/10 text-guiso-orange text-xs font-bold uppercase tracking-widest"
        >
          <Badge variant="primary">MVP Funcional</Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-display font-bold tracking-tight max-w-5xl mx-auto leading-tight"
        >
          GUISO — Tecnología para generar <span className="text-guiso-orange">impacto verificable</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed"
        >
          GUISO es un ecosistema digital que conecta personas, comercios y proyectos mediante pagos con trazabilidad y transparencia.
        </motion.p>
      </section>

      {/* SECCIÓN 2 — EL PROBLEMA */}
      <section className="max-w-4xl mx-auto">
        <Card variant="glass" padding="xl" className="border-red-100 bg-red-50/10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">El Desafío</h2>
              <ul className="space-y-4">
                {[
                  "La gestión de recursos carece de transparencia técnica.",
                  "Los ecosistemas no participan en la validación de resultados.",
                  "El impacto generado es difícil de medir y verificar."
                ].map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 leading-relaxed">
                Actualmente, la confianza en los sistemas de impacto está limitada por la falta de trazabilidad y la desconexión entre la acción y el resultado verificado.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* SECCIÓN 3 — LA SOLUCIÓN GUISO */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-display font-bold">La Solución GUISO</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Un modelo de economía circular donde cada acción fortalece el tejido social.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Pagos con Impacto",
              desc: "Cada transacción genera impacto social medible de forma automática."
            },
            {
              icon: Users,
              title: "Gobernanza Comunitaria",
              desc: "La comunidad vota qué proyectos apoyar mediante un sistema democrático."
            },
            {
              icon: ShieldCheck,
              title: "Reputación Social",
              desc: "El impacto crea confianza digital verificable para todos los participantes."
            }
          ].map((item, i) => (
            <Card key={i} variant="glass" padding="lg" className="space-y-4 hover:border-guiso-orange/30 transition-all">
              <div className="w-12 h-12 bg-guiso-orange/10 rounded-2xl flex items-center justify-center text-guiso-orange">
                <item.icon size={24} />
              </div>
              <h3 className="text-xl font-display font-bold">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECCIÓN 4 — CÓMO FUNCIONA */}
      <section className="space-y-12">
        <h2 className="text-3xl font-display font-bold text-center">Cómo Funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: CreditCard, step: "1", title: "Participa", desc: "Usuario paga o participa en el ecosistema." },
            { icon: Heart, step: "2", title: "Registra", desc: "Se registra el impacto social generado." },
            { icon: Vote, step: "3", title: "Valida", desc: "Comunidad valida y vota los proyectos." },
            { icon: FileCheck, step: "4", title: "Certifica", desc: "Se generan certificados de impacto inmutables." }
          ].map((item, i) => (
            <div key={i} className="relative group">
              <Card variant="glass" padding="md" className="text-center space-y-4 h-full">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 group-hover:bg-guiso-orange/10 group-hover:text-guiso-orange transition-colors">
                  <item.icon size={20} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-guiso-orange uppercase tracking-widest">Paso {item.step}</span>
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </Card>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-gray-200">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 5 — POR QUÉ BLOCKCHAIN */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-display font-bold">¿Por qué Blockchain?</h2>
          <p className="text-gray-500 leading-relaxed">
            La tecnología blockchain permite transparencia, trazabilidad y confianza sin depender de intermediarios. Es el pilar que asegura que cada centavo llegue a su destino.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, text: "Transparencia Total" },
              { icon: Layers, text: "Registro Verificable" },
              { icon: ShieldCheck, text: "Confianza Pública" },
              { icon: Link, text: "Sin Intermediarios" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                <div className="text-guiso-orange"><item.icon size={18} /></div>
                <span className="text-sm font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-guiso-dark rounded-[2rem] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-guiso-orange/20 blur-[80px]" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-guiso-orange">
              <Cpu size={40} />
            </div>
            <p className="text-white/80 font-display text-xl italic leading-relaxed">
              "La descentralización no es solo técnica, es una herramienta de eficiencia y transparencia humanitaria."
            </p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6 — ESTADO ACTUAL */}
      <section>
        <Card variant="cream" padding="xl" rounded="3xl" className="border-guiso-orange/20">
          <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
            <div className="w-16 h-16 bg-guiso-orange/10 text-guiso-orange rounded-2xl flex items-center justify-center shrink-0">
              <Info size={32} />
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-2xl font-display font-bold">Estado del Proyecto</h2>
                <Badge variant="primary">Simulación MVP</Badge>
              </div>
              <p className="text-gray-600 leading-relaxed">
                GUISO actualmente opera como un MVP funcional en modo simulación. Todas las interacciones representan el comportamiento real que tendrá el sistema cuando se conecte a infraestructura blockchain y pagos reales.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* SECCIÓN 7 — VISIÓN FUTURA */}
      <section className="text-center space-y-8 py-12">
        <div className="w-16 h-16 bg-guiso-orange/10 text-guiso-orange rounded-full flex items-center justify-center mx-auto">
          <Sparkles size={32} />
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-bold max-w-3xl mx-auto leading-tight">
          Nuestra Visión Futura
        </h2>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Nuestro objetivo es convertir cada transacción cotidiana en una oportunidad de impacto y construir ecosistemas más sólidos mediante tecnología abierta.
        </p>
        <div className="pt-8">
          <Button size="lg" className="gap-2">
            Contactar con el Equipo
            <ArrowRight size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
}

