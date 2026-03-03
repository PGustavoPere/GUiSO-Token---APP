import React, { useEffect, useState } from 'react';
import { api, Project } from '../../services/api';
import { Heart, CheckCircle2, Clock, MapPin, Share2, Sparkles } from 'lucide-react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import SupportModal from './SupportModal';
import { Card, Button, Badge } from '../../components/ui';

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
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Impacto Verificable</h1>
          <p className="text-gray-500 text-sm md:text-base">Proyectos financiados y validados por el ecosistema GUISO.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="px-4 py-2 bg-white rounded-full text-xs md:text-sm font-bold border border-gray-100 shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto">
            <Sparkles size={16} className="text-guiso-orange" />
            Tu Impacto: <span className="text-guiso-orange">{user.impactScore} IP</span>
          </div>
        </div>
      </header>

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
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Transparencia Radical</h2>
          <p className="text-white/80 text-sm md:text-base mb-6 md:mb-8">Cada token destinado a impacto es rastreable mediante tecnología blockchain. Demostramos la trazabilidad con datos inmutables y auditoría abierta.</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
            <Button variant="secondary" className="w-full sm:w-auto bg-white text-guiso-terracotta hover:bg-guiso-cream">
              Explorar Ledger de Impacto
            </Button>
            <Button variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white">
              Cómo funciona el DAO
            </Button>
          </div>
        </div>
        <Heart size={200} className="absolute -right-10 -bottom-10 md:-right-20 md:-bottom-20 text-white/5 rotate-12 md:w-[300px] md:h-[300px]" />
      </Card>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
