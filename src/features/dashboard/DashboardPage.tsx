import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Zap, X, Info, Star, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import ImpactDashboard from '../../components/ImpactDashboard';
import ImpactTransactionPanel from '../../components/ImpactTransactionPanel';
import ImpactHistory from '../../components/ImpactHistory';
import CertificateHistory from '../impactCertificate/CertificateHistory';
import InvestorPanel from '../../components/InvestorPanel';
import IdentityPanel from '../identity/IdentityPanel';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { Card, Button } from '../../components/ui';

export default function DashboardPage() {
  const { user } = useGuisoCore();
  const [showLevelsModal, setShowLevelsModal] = React.useState(false);

  const levels = [
    { name: 'Semilla', minIp: 0, color: 'bg-gray-100 text-gray-500', icon: '🌱', desc: 'Tu inicio en el ecosistema. Empezás a sembrar impacto.' },
    { name: 'Brote', minIp: 500, color: 'bg-green-100 text-green-600', icon: '🌿', desc: 'Tu compromiso crece. Ya sos un actor reconocido.' },
    { name: 'Raíz', minIp: 2000, color: 'bg-amber-100 text-amber-700', icon: '🪵', desc: 'Impacto sólido. Tu voz tiene peso en la comunidad.' },
    { name: 'Árbol', minIp: 5000, color: 'bg-emerald-100 text-emerald-700', icon: '🌳', desc: 'Liderazgo humanitario. Validás propuestas del DAO.' },
    { name: 'Bosque', minIp: 15000, color: 'bg-guiso-orange/10 text-guiso-orange', icon: '🌲', desc: 'Leyenda del impacto. Máximo poder de gobernanza.' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-guiso-dark p-6 md:p-16 text-white">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-guiso-orange blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-widest"
          >
            <Zap size={14} className="text-guiso-orange" />
            Impact Ecosystem MVP v1.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-7xl font-display font-bold leading-[1.1] md:leading-[0.9] tracking-tight"
          >
            Tus Acciones, <br />
            <span className="text-guiso-orange">Impacto Real.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-white/60 leading-relaxed"
          >
            GUISO transforma cada transacción en una oportunidad de impacto verificable. 
            Conecta tu wallet y empieza a generar trazabilidad humanitaria hoy mismo.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4"
          >
            <Link to="/impacto" className="w-full sm:w-auto">
              <Button size="lg" className="w-full flex items-center justify-center gap-2">
                Explorar Causas
                <ArrowRight size={20} />
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-full border border-white/20 text-sm font-bold w-full sm:w-auto">
              <ShieldCheck size={20} className="text-green-400" />
              Impacto Verificado
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investor Metrics (Simulated) */}
      <InvestorPanel />

      {/* MVP Core Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <section id="dashboard-stats" className="space-y-4">
            <h2 className="text-2xl font-display font-bold px-2">Panel de Control</h2>
            <ImpactDashboard />
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold px-2">My Impact Identity</h2>
            <IdentityPanel />
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold px-2">Historial Reciente</h2>
            <ImpactHistory />
          </section>

          <section className="space-y-4">
            <CertificateHistory />
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <section id="transaction-panel" className="space-y-4">
            <h2 className="text-2xl font-display font-bold px-2">Acción Rápida</h2>
            <ImpactTransactionPanel />
          </section>

          {/* Education Card */}
          <Card variant="cream" padding="md" rounded="2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-guiso-orange rounded-xl flex items-center justify-center text-white">
                <Heart size={20} />
              </div>
              <h4 className="font-display font-bold">¿Cómo funciona?</h4>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Cada vez que aportas GSO, el sistema calcula el impacto humanitario generado. 
              Tus puntos de impacto (IP) determinan tu nivel de participación y tu poder de validación.
            </p>
            <button 
              onClick={() => setShowLevelsModal(true)}
              className="text-guiso-orange text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
              Saber más sobre niveles <ArrowRight size={14} />
            </button>
          </Card>
        </div>
      </div>

      {/* Levels Info Modal */}
      <AnimatePresence>
        {showLevelsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-guiso-cream/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-guiso-orange/10 rounded-xl text-guiso-orange">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-xl font-display font-bold">Niveles de Reputación</h3>
                </div>
                <button onClick={() => setShowLevelsModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-guiso-dark text-white p-6 rounded-2xl space-y-3">
                  <h4 className="font-bold flex items-center gap-2">
                    <Star size={18} className="text-guiso-orange" />
                    ¿Para qué sirven los niveles?
                  </h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    En GUISO, tu reputación no se compra, se construye. A medida que generas impacto real, acumulas <span className="text-guiso-orange font-bold">Impact Points (IP)</span> que desbloquean beneficios exclusivos:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <li className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <Award size={14} className="text-guiso-orange" />
                      Mayor poder de voto en el DAO
                    </li>
                    <li className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <Award size={14} className="text-guiso-orange" />
                      Certificados de impacto premium
                    </li>
                    <li className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <Award size={14} className="text-guiso-orange" />
                      Acceso a preventas exclusivas
                    </li>
                    <li className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <Award size={14} className="text-guiso-orange" />
                      Insignias de perfil verificadas
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 px-2">Escala de Impacto</h4>
                  <div className="space-y-2">
                    {levels.map((lvl, idx) => (
                      <div key={lvl.name} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="text-2xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl">
                          {lvl.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">{lvl.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lvl.color}`}>
                              {lvl.minIp}+ IP
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{lvl.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0 h-fit">
                    <Info size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-blue-900 mb-1">¿Cómo subo de nivel?</h5>
                    <p className="text-xs text-blue-800/70">
                      Cada vez que apoyas una causa desde el panel de "Acción Rápida", recibes IP proporcional a tu aporte. El sistema actualiza tu rango automáticamente en la red.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => setShowLevelsModal(false)}>Entendido</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
