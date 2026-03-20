import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Proposal } from './communityTypes';

interface CommunityContextType {
  proposals: Proposal[];
  vote: (proposalId: string, walletAddress: string) => void;
  hasVoted: (proposalId: string, walletAddress: string) => boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const STORAGE_KEY = 'guiso_community_proposals';

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Comedor comunitario Córdoba',
    description: 'Financiamiento para raciones diarias y equipamiento de cocina para el barrio San Vicente.',
    impactGoal: 500,
    votes: 142,
    voters: [],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'prop-2',
    title: 'Kits escolares solidarios',
    description: 'Distribución de mochilas y útiles completos para 100 niños en zonas rurales de la provincia.',
    impactGoal: 300,
    votes: 89,
    voters: [],
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'prop-3',
    title: 'Refugio nocturno invierno',
    description: 'Habilitación de espacio con calefacción y mantas para personas en situación de calle durante junio-agosto.',
    impactGoal: 1000,
    votes: 456,
    voters: [],
    createdAt: Date.now(),
  }
];

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>(INITIAL_PROPOSALS);

  const vote = useCallback((proposalId: string, walletAddress: string) => {
    setProposals(prev => {
      const updated = prev.map(p => {
        if (p.id === proposalId && !p.voters.includes(walletAddress)) {
          return {
            ...p,
            votes: p.votes + 1,
            voters: [...p.voters, walletAddress]
          };
        }
        return p;
      });
      return updated;
    });
  }, []);

  const hasVoted = useCallback((proposalId: string, walletAddress: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    return proposal ? proposal.voters.includes(walletAddress) : false;
  }, [proposals]);

  return (
    <CommunityContext.Provider value={{ proposals, vote, hasVoted }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within a CommunityProvider');
  return context;
};
