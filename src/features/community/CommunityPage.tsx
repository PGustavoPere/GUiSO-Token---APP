import React from 'react';
import { motion } from 'motion/react';
import { Vote, Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { useCommunityStore } from './CommunityStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';

export default function CommunityPage() {
  const { proposals, userVotes, vote } = useCommunityStore();
  const { user } = useGuisoCore();
  
  // Voting power based on GSO balance + Impact Points
  const votingPower = Math.floor(user.balance + (user.impactScore * 0.5));

  const handleVote = (proposalId: string, voteType: 'for' | 'against') => {
    if (!user.isWalletConnected) {
      alert("Conecta tu wallet para votar");
      return;
    }
    vote(proposalId, voteType, votingPower);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-guiso-orange mb-2">
          <Users size={24} />
          <span className="font-mono font-bold tracking-wider uppercase text-sm">Gobernanza Descentralizada</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-guiso-dark">
          Comunidad DAO
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg">
          Tu voz decide el futuro de GUISO. Usa tu poder de voto (GSO + IP) para aprobar proyectos sociales y cambios en el protocolo.
        </p>
      </header>

      {/* Voting Power Card */}
      <Card variant="glass" className="bg-gradient-to-br from-black/80 to-black/40 border-guiso-orange/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-gray-400 font-mono text-sm mb-1">Tu Poder de Voto Actual</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display font-bold text-guiso-orange">{votingPower.toLocaleString()}</span>
              <span className="text-guiso-orange/60 font-mono text-sm">vPwr</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Basado en tu balance de GSO y Puntos de Impacto (IP)</p>
          </div>
          {!user.isWalletConnected && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              <span>Conecta tu wallet para participar en la gobernanza</span>
            </div>
          )}
        </div>
      </Card>

      {/* Proposals List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-guiso-dark flex items-center gap-2">
          <Vote size={24} className="text-guiso-orange" />
          Propuestas Activas
        </h2>

        {proposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst;
          const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
          const againstPercentage = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
          const hasVoted = userVotes[proposal.id];
          const isActive = proposal.status === 'active';

          return (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card variant="glass" className="hover:border-guiso-orange/50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        isActive ? 'bg-guiso-orange/20 text-guiso-orange border border-guiso-orange/30' : 
                        proposal.status === 'passed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {isActive ? 'ACTIVA' : proposal.status === 'passed' ? 'APROBADA' : 'RECHAZADA'}
                      </span>
                      <span className="text-gray-500 text-sm font-mono flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(proposal.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-guiso-orange mb-2">{proposal.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{proposal.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                      <span>Autor:</span>
                      <span className="text-guiso-orange/70">{proposal.author}</span>
                    </div>
                  </div>

                  <div className="w-full md:w-64 space-y-4 bg-black/30 p-4 rounded-xl border border-white/5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400 font-bold">A Favor</span>
                        <span className="text-gray-400">{proposal.votesFor.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${forPercentage}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400 font-bold">En Contra</span>
                        <span className="text-gray-400">{proposal.votesAgainst.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${againstPercentage}%` }} />
                      </div>
                    </div>

                    {isActive && (
                      <div className="pt-4 mt-4 border-t border-white/10">
                        {hasVoted ? (
                          <div className="text-center text-sm font-mono text-guiso-orange flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} />
                            Votaste {hasVoted === 'for' ? 'A Favor' : 'En Contra'}
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500/30"
                              onClick={() => handleVote(proposal.id, 'for')}
                              disabled={!user.isWalletConnected}
                            >
                              A Favor
                            </Button>
                            <Button 
                              className="flex-1 bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                              onClick={() => handleVote(proposal.id, 'against')}
                              disabled={!user.isWalletConnected}
                            >
                              En Contra
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
