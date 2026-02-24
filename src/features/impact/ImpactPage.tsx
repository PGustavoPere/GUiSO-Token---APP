import React, { useEffect, useState } from 'react';
import { api, Project } from '../../services/api';
import { Heart, CheckCircle2, Clock, MapPin, Share2, Sparkles } from 'lucide-react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import SupportModal from './SupportModal';

export default function ImpactPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user } = useGuisoCore();

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
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl mb-2">Impacto Social</h1>
          <p className="text-gray-500">Proyectos financiados y apoyados por la comunidad GUISO.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white rounded-full text-sm font-bold border border-gray-100 shadow-sm flex items-center gap-2">
            <Sparkles size={16} className="text-guiso-orange" />
            Tu Impacto: <span className="text-guiso-orange">{user.impactScore} IP</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="glass-card overflow-hidden group">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg",
                  project.status === 'active' ? "bg-guiso-orange text-white" : "bg-green-500 text-white"
                )}>
                  {project.status === 'active' ? 'En Curso' : 'Completado'}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 text-xs text-guiso-orange font-bold uppercase tracking-widest mb-3">
                <MapPin size={14} />
                {project.category}
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">{project.title}</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">{project.description}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold">{project.raised.toLocaleString()} GSO</span>
                  <span className="text-xs text-gray-400">Objetivo: {project.goal.toLocaleString()} GSO</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", project.status === 'active' ? "bg-guiso-orange" : "bg-green-500")}
                    style={{ width: `${(project.raised / project.goal) * 100}%` }} 
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {project.status === 'active' ? <Clock size={16} /> : <CheckCircle2 size={16} className="text-green-500" />}
                    <span>{project.status === 'active' ? 'Quedan 12 días' : 'Finalizado con éxito'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProject(project)}
                    disabled={project.status !== 'active' || !user.isWalletConnected}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-bold transition-all",
                      project.status === 'active' && user.isWalletConnected 
                        ? "bg-guiso-orange text-white hover:shadow-lg active:scale-95" 
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {!user.isWalletConnected ? 'Conecta Wallet' : project.status === 'active' ? 'Apoyar Causa' : 'Ver Evidencia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <SupportModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Transparency Section */}
      <div className="glass-card p-10 bg-guiso-terracotta text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-display font-bold mb-4">Transparencia Radical</h2>
          <p className="text-white/80 mb-8">Cada token destinado a ayuda social es rastreable en la blockchain. No solo decimos que ayudamos, lo demostramos con datos inmutables.</p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-white text-guiso-terracotta font-bold rounded-xl hover:bg-guiso-cream transition-colors">
              Explorar Ledger de Impacto
            </button>
            <button className="px-8 py-3 bg-guiso-terracotta border border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Cómo funciona el DAO
            </button>
          </div>
        </div>
        <Heart size={300} className="absolute -right-20 -bottom-20 text-white/5 rotate-12" />
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
