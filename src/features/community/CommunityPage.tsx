import React from 'react';
import { useCommunity } from './CommunityStore';
import { useWallet } from '../../core/WalletProvider';
import { Card, Button, Badge } from '../../components/ui';
import { Vote, Users, Info, Award } from 'lucide-react';
import { motion } from 'motion/react';
import Leaderboard from '../../components/Leaderboard';

export default function CommunityPage() {
  const { proposals, vote, hasVoted } = useCommunity();
  const { address, isConnected, connect } = useWallet();

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-guiso-dark">Ecosistema</h1>
          <p className="text-gray-500">Tu participación valida el próximo paso del ecosistema GUISO.</p>
        </div>
        <Badge variant="primary" className="w-fit py-2 px-4 gap-2">
          <Users size={16} />
          <span>Validación Comunitaria</span>
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proposals Column */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-display font-bold px-2">Propuestas Activas</h2>
          <div className="grid grid-cols-1 gap-6">
            {proposals.map((proposal) => {
              const voted = address ? hasVoted(proposal.id, address) : false;
              const progress = Math.min((proposal.votes / proposal.impactGoal) * 100, 100);

              return (
                <Card key={proposal.id} variant="glass" padding="lg" className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-display font-bold text-guiso-dark">{proposal.title}</h3>
                    <Badge variant={voted ? "success" : "neutral"}>
                      {voted ? "Votado" : "Pendiente"}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 flex-1">{proposal.description}</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end text-sm">
                      <span className="text-gray-400 font-medium">Progreso de Votación</span>
                      <span className="font-bold text-guiso-orange">{proposal.votes} / {proposal.impactGoal} Votos</span>
                    </div>
                    
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-guiso-orange transition-all duration-500"
                      />
                    </div>

                    {!isConnected ? (
                      <Button variant="outline" className="w-full gap-2" onClick={connect}>
                        Conectar Wallet para Votar
                      </Button>
                    ) : (
                      <Button 
                        className="w-full gap-2" 
                        disabled={voted}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => vote(proposal.id, address!)}
                      >
                        <Vote size={18} />
                        {voted ? "Voto Registrado" : "Votar Propuesta"}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Column */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold px-2">Líderes de Impacto</h2>
          <Leaderboard />
        </div>
      </div>

      <Card variant="glass" padding="md" className="bg-guiso-orange/5 border-guiso-orange/10 flex gap-4 items-start">
        <div className="p-2 bg-guiso-orange/10 rounded-lg text-guiso-orange">
          <Info size={20} />
        </div>
        <div>
          <h4 className="font-bold text-guiso-dark">Sobre la Validación</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Este sistema de votación es una simulación funcional. En la versión final, cada voto será una transacción on-chain 
            basada en Impact Power derivado de la actividad en el ecosistema.
          </p>
        </div>
      </Card>
    </div>
  );
}
