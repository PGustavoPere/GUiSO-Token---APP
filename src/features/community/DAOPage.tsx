import React, { useState, useMemo } from 'react';
import { useCommunity } from './CommunityStore';
import { useWallet } from '../../core/WalletProvider';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { Card, Button, Badge } from '../../components/ui';
import { Vote, Users, Info, Plus, X, CheckCircle2, AlertCircle, TrendingUp, Shield, Clock, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Proposal, ProposalStatus } from './communityTypes';

export default function DAOPage() {
  const { proposals, vote, hasVoted, createProposal } = useCommunity();
  const { address, isConnected, connect } = useWallet();
  const { user, token } = useGuisoCore();
  
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form State
  const [newProp, setNewProp] = useState({
    title: '',
    description: '',
    category: 'social' as const,
    impactGoal: 1000,
    durationDays: 7
  });

  const votingPower = useMemo(() => {
    if (!isConnected) return 0;
    // Weighted logic: GSO Balance + Impact Score (Participation History)
    // This rewards both holders and active participants
    return token.gsoBalance + user.impactScore;
  }, [isConnected, token.gsoBalance, user.impactScore]);

  const filteredProposals = useMemo(() => {
    return proposals.filter(p => {
      const statusMatch = activeTab === 'active' ? p.status === 'active' : p.status !== 'active';
      const categoryMatch = filterCategory === 'all' || p.category === filterCategory;
      return statusMatch && categoryMatch;
    });
  }, [proposals, activeTab, filterCategory]);

  const handleCreateProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    createProposal({
      ...newProp,
      proposer: address,
      endDate: Date.now() + (newProp.durationDays * 86400000)
    });
    
    setShowNewProposalModal(false);
    setNewProp({ title: '', description: '', category: 'social', impactGoal: 1000, durationDays: 7 });
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-600';
      case 'passed': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      case 'executed': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-guiso-orange font-bold text-xs uppercase tracking-widest">
            <Shield size={14} />
            DAO Governance Protocol v1.0
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-guiso-dark tracking-tight">Ecosistema</h1>
          <p className="text-gray-500 max-w-xl">
            Propón, vota y decide el futuro de GUISO. Un sistema de gobernanza donde tu compromiso real pesa tanto como tus tokens.
          </p>
        </div>
        <Button 
          onClick={() => isConnected ? setShowNewProposalModal(true) : connect()}
          className="gap-2 h-14 px-8 rounded-2xl shadow-lg shadow-guiso-orange/20"
        >
          <Plus size={20} />
          Nueva Propuesta
        </Button>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" padding="md" className="flex items-center gap-4 border-guiso-orange/10">
          <div className="w-12 h-12 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Participación</p>
            <p className="text-xl font-bold text-guiso-dark">1,240 Miembros</p>
          </div>
        </Card>
        <Card variant="glass" padding="md" className="flex items-center gap-4 border-guiso-orange/10">
          <div className="w-12 h-12 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
            <Vote size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tu Poder de Voto</p>
            <p className="text-xl font-bold text-guiso-dark">
              {isConnected ? votingPower.toLocaleString() : '---'} 
              <span className="text-xs font-normal text-gray-400 ml-1">VP</span>
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="md" className="flex items-center gap-4 border-guiso-orange/10">
          <div className="w-12 h-12 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
            <Shield size={24} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Quórum Requerido</p>
            <p className="text-xl font-bold text-guiso-dark">65% Aprobación</p>
          </div>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100 pb-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-guiso-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Activas
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'archive' ? 'bg-white text-guiso-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Archivo
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          <Filter size={16} className="text-gray-400 shrink-0" />
          {['all', 'social', 'economic', 'technical', 'governance'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterCategory === cat ? 'bg-guiso-dark text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-guiso-orange/30'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredProposals.map((proposal) => {
            const voted = address ? hasVoted(proposal.id, address) : false;
            const progress = Math.min((proposal.currentPower / proposal.impactGoal) * 100, 100);
            const timeLeft = Math.max(0, proposal.endDate - Date.now());
            const daysLeft = Math.ceil(timeLeft / 86400000);

            return (
              <motion.div
                key={proposal.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card variant="glass" padding="none" className="flex flex-col h-full group hover:border-guiso-orange/30 transition-all overflow-hidden">
                  <div className="p-6 md:p-8 flex-1">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral" className="w-fit uppercase text-[10px] tracking-widest">
                            {proposal.category}
                          </Badge>
                          <Badge variant="neutral" className="text-[9px] border-guiso-orange/30 text-guiso-orange h-5">
                            DAO Verified
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-display font-bold text-guiso-dark group-hover:text-guiso-orange transition-colors">
                          {proposal.title}
                        </h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </div>
                    </div>
                    
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                      {proposal.description}
                    </p>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end text-xs">
                          <span className="text-gray-400 font-bold uppercase tracking-wider">Poder Acumulado</span>
                          <span className="font-bold text-guiso-dark">
                            {proposal.currentPower.toLocaleString()} / {proposal.impactGoal.toLocaleString()} VP
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${proposal.status === 'passed' ? 'bg-green-500' : 'bg-guiso-orange'}`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={14} />
                          <span>{daysLeft > 0 ? `Cierra en ${daysLeft} días` : 'Cerrada'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Users size={14} />
                          <span>{proposal.voters.length} Votantes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                    {!isConnected ? (
                      <Button variant="outline" className="w-full gap-2" onClick={connect}>
                        Conectar para Votar
                      </Button>
                    ) : (
                      <Button 
                        className="w-full gap-2 h-12" 
                        disabled={voted || proposal.status !== 'active' || daysLeft <= 0}
                        onClick={() => vote(proposal.id, address!, votingPower)}
                      >
                        {voted ? (
                          <>
                            <CheckCircle2 size={18} />
                            Voto Registrado
                          </>
                        ) : proposal.status !== 'active' ? (
                          'Votación Finalizada'
                        ) : (
                          <>
                            <Vote size={18} />
                            Votar con {votingPower.toLocaleString()} VP
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <Info size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-400">No hay propuestas en esta sección</h3>
          <p className="text-gray-400 text-sm mt-2">Sé el primero en proponer un cambio positivo.</p>
        </div>
      )}

      {/* Info Section */}
      <Card variant="terracotta" padding="xl" rounded="3xl" className="relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <h2 className="text-3xl font-display font-bold text-white">¿Cómo funciona el peso del voto?</h2>
          <p className="text-white/80 leading-relaxed">
            Para evitar la "tiranía de las ballenas", GUISO utiliza un sistema de peso híbrido. Tu poder de voto (VP) se calcula sumando tus tokens <span className="font-bold text-white">GSO</span> y tus <span className="font-bold text-white">Impact Points (IP)</span>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                <Shield size={16} className="text-guiso-orange" />
                Protección Anti-Ballena
              </h4>
              <p className="text-xs text-white/60">El IP premia el compromiso histórico, permitiendo que usuarios activos tengan voz real frente a grandes holders pasivos.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-guiso-orange" />
                Transparencia On-Chain
              </h4>
              <p className="text-xs text-white/60">Próximamente, cada voto será registrado como una transacción en la blockchain para una auditoría total.</p>
            </div>
          </div>
        </div>
        <Vote size={200} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </Card>

      {/* New Proposal Modal */}
      <AnimatePresence>
        {showNewProposalModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-guiso-cream/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-guiso-orange/10 rounded-xl text-guiso-orange">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-bold">Crear Propuesta</h3>
                </div>
                <button onClick={() => setShowNewProposalModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título de la Iniciativa</label>
                  <input 
                    required
                    type="text"
                    value={newProp.title}
                    onChange={e => setNewProp({...newProp, title: e.target.value})}
                    placeholder="Ej. Comedor Comunitario Barrio Norte"
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['social', 'economic', 'technical', 'governance'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewProp({...newProp, category: cat as any})}
                        className={`p-3 rounded-xl text-sm font-bold border transition-all ${newProp.category === cat ? 'bg-guiso-orange/10 border-guiso-orange text-guiso-orange' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-200'}`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción Detallada</label>
                  <textarea 
                    required
                    rows={4}
                    value={newProp.description}
                    onChange={e => setNewProp({...newProp, description: e.target.value})}
                    placeholder="Explica por qué esta propuesta es importante y cómo se utilizarán los recursos..."
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-guiso-orange/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Meta de Impacto (VP)</label>
                    <input 
                      required
                      type="number"
                      value={newProp.impactGoal}
                      onChange={e => setNewProp({...newProp, impactGoal: Number(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duración (Días)</label>
                    <input 
                      required
                      type="number"
                      value={newProp.durationDays}
                      onChange={e => setNewProp({...newProp, durationDays: Number(e.target.value)})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                  <AlertCircle size={20} className="text-blue-500 shrink-0" />
                  <p className="text-[10px] text-blue-700 leading-relaxed">
                    Al crear una propuesta, te comprometes a liderar la iniciativa si es aprobada. Asegúrate de que los objetivos sean realistas y beneficiosos para la comunidad.
                  </p>
                </div>

                <Button type="submit" className="w-full py-4 text-lg">
                  Publicar Propuesta
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
