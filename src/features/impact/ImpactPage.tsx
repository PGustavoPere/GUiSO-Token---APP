import React, { useEffect, useState } from 'react';
import { api, Project } from '../../services/api';
import { Heart, CheckCircle2, Clock, MapPin, Share2, Sparkles, Shield, Info, ExternalLink, Vote, X } from 'lucide-react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useImpactExplorerStore } from '../impactExplorer/ImpactExplorerStore';
import SupportModal from './SupportModal';
import CertificateHistory from '../impactCertificate/CertificateHistory';
import EcosystemActivityFeed from '../../components/EcosystemActivityFeed';
import { Card, Button, Badge } from '../../components/ui';
import { motion, AnimatePresence } from 'motion/react';

export default function ImpactPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showLedger, setShowLedger] = useState(false);
  const [showDAO, setShowDAO] = useState(false);
  const { user } = useGuisoCore();
  const { getRecentEvents } = useImpactExplorerStore();

  const recentEvents = getRecentEvents().slice(0, 5);

  useEffect(() => {
    api.getProjects().then(data => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => <div key={i} className="h-96 bg-gray-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Ayuda Verificable</h1>
          <p className="text-gray-500 text-sm md:text-base">Causas apoyadas y validadas por personas como vos en la comunidad GUISO.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-full text-xs md:text-sm font-bold border border-gray-100 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
            <Sparkles size={16} className="text-guiso-orange" />
            Tu Compromiso: <span className="text-guiso-orange">{user.impactScore} IP</span>
          </div>
        </div>
      </header>

      {/* Ecosystem Activity Feed */}
      <section className="max-w-3xl mx-auto w-full">
        <EcosystemActivityFeed />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <Card key={project.id} variant="glass" padding="none" className="group">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={project.status === 'active' ? 'primary' : 'success'} className="shadow-lg">
                  {project.status === 'active' ? 'En Curso' : 'Completado'}
                </Badge>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-guiso-orange font-bold uppercase tracking-widest mb-3">
                <MapPin size={14} />
                {project.category}
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold mb-3">{project.title}</h3>
              <p className="text-gray-500 text-xs md:text-sm mb-6 line-clamp-2">{project.description}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold">{project.raised.toLocaleString()} GSO</span>
                  <span className="text-[10px] md:text-xs text-gray-400">Objetivo: {project.goal.toLocaleString()} GSO</span>
                </div>
                <div className="w-full bg-gray-100 h-2 md:h-3 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", project.status === 'active' ? "bg-guiso-orange" : "bg-green-500")}
                    style={{ width: `${(project.raised / project.goal) * 100}%` }} 
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-50 gap-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    {project.status === 'active' ? <Clock size={16} /> : <CheckCircle2 size={16} className="text-green-500" />}
                    <span>{project.status === 'active' ? 'Quedan 12 días' : 'Finalizado con éxito'}</span>
                  </div>
                  <Button 
                    onClick={() => setSelectedProject(project)}
                    disabled={project.status !== 'active' || !user.isWalletConnected}
                    variant={project.status === 'active' && user.isWalletConnected ? 'primary' : 'ghost'}
                    className={cn(
                      "w-full sm:w-auto",
                      (!project.status || !user.isWalletConnected) && "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400"
                    )}
                  >
                    {!user.isWalletConnected ? 'Conecta Wallet' : project.status === 'active' ? 'Apoyar Causa' : 'Ver Evidencia'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedProject && (
        <SupportModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Transparency Section */}
      <Card variant="terracotta" padding="xl" rounded="3xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Transparencia para Confiar</h2>
          <p className="text-white/80 text-sm md:text-base mb-6 md:mb-8">Cada aporte que realizas es rastreable. Utilizamos tecnología para asegurar que la ayuda llegue a su destino, permitiendo que cualquiera pueda verificar la trazabilidad de forma abierta.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
            <Button 
              onClick={() => setShowLedger(true)}
              variant="secondary" 
              className="w-full sm:w-auto bg-white text-guiso-terracotta hover:bg-guiso-cream"
            >
              Ver Registro de Ayuda
            </Button>
            <Button 
              onClick={() => setShowDAO(true)}
              variant="outline" 
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Cómo participamos todos
            </Button>
          </div>
        </div>
        <Heart size={200} className="absolute -right-10 -bottom-10 md:-right-20 md:-bottom-20 text-white/5 rotate-12 md:w-[300px] md:h-[300px]" />
      </Card>

      {/* Certificates Section */}
      <section className="space-y-4">
        <CertificateHistory />
      </section>

      {/* Ledger Modal */}
      <AnimatePresence>
        {showLedger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-guiso-cream/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-guiso-orange/10 rounded-xl text-guiso-orange">
                    <Shield size={24} />
                  </div>
                  <h3 className="text-xl font-display font-bold">Ledger de Impacto</h3>
                </div>
                <button onClick={() => setShowLedger(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-gray-500 mb-4">
                  Registro público de las últimas transacciones de impacto verificadas en la red GUISO. Cada entrada representa ayuda real entregada.
                </p>
                
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <Heart size={18} fill="currentColor" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{event.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{event.txHash.slice(0, 16)}...</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-guiso-orange font-bold">+{event.impactAmount} IP</p>
                      <p className="text-[10px] text-gray-400">Verificado</p>
                    </div>
                  </div>
                ))}
                
                {recentEvents.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p>No hay transacciones recientes en el ledger.</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => setShowLedger(false)}>Cerrar Ledger</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DAO Modal */}
      <AnimatePresence>
        {showDAO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-guiso-dark text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl text-guiso-orange">
                    <Vote size={24} />
                  </div>
                  <h3 className="text-xl font-display font-bold">Gobernanza DAO</h3>
                </div>
                <button onClick={() => setShowDAO(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section className="space-y-3">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Info size={18} className="text-guiso-orange" />
                    ¿Qué es el DAO de GUISO?
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La Organización Autónoma Descentralizada (DAO) permite que la comunidad tome las decisiones importantes. No hay una entidad central que decida a dónde va el dinero; lo decides tú con tus tokens GSO.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-guiso-cream/30 rounded-2xl border border-guiso-orange/10">
                    <h5 className="font-bold text-sm mb-2">Impact Power (IP)</h5>
                    <p className="text-xs text-gray-500">Tu poder de voto no solo depende de cuántos tokens tienes, sino de cuánto impacto has generado previamente.</p>
                  </div>
                  <div className="p-4 bg-guiso-cream/30 rounded-2xl border border-guiso-orange/10">
                    <h5 className="font-bold text-sm mb-2">Propuestas Abiertas</h5>
                    <p className="text-xs text-gray-500">Cualquier miembro con suficiente reputación puede proponer una nueva causa para ser financiada.</p>
                  </div>
                </div>

                <section className="space-y-3">
                  <h4 className="font-bold text-lg">El Proceso de Votación</h4>
                  <ol className="space-y-4">
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-guiso-orange text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                      <p className="text-sm text-gray-600"><span className="font-bold text-guiso-dark">Propuesta:</span> Se presenta un proyecto con objetivos claros y presupuesto en GSO.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-guiso-orange text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                      <p className="text-sm text-gray-600"><span className="font-bold text-guiso-dark">Votación:</span> Los holders usan su Impact Power para validar la viabilidad y prioridad.</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-guiso-orange text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                      <p className="text-sm text-gray-600"><span className="font-bold text-guiso-dark">Ejecución:</span> Si se aprueba, los fondos se liberan mediante smart contracts según hitos verificables.</p>
                    </li>
                  </ol>
                </section>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button onClick={() => setShowDAO(false)}>Entendido</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
