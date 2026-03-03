import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
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
            <Link to="/comunidad" className="text-guiso-orange text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Saber más sobre niveles <ArrowRight size={14} />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
