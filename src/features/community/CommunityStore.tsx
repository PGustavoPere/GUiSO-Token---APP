import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Proposal, ProposalStatus } from './communityTypes';
import { useGuisoCore } from '../../core/GuisoCoreStore';

interface CommunityContextType {
  proposals: Proposal[];
  vote: (proposalId: string, walletAddress: string, power: number) => void;
  createProposal: (proposal: Omit<Proposal, 'id' | 'currentPower' | 'voters' | 'createdAt' | 'status'>) => void;
  hasVoted: (proposalId: string, walletAddress: string) => boolean;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const STORAGE_KEY = 'guiso_community_proposals_v2';

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Comedor comunitario Córdoba',
    description: 'Financiamiento para raciones diarias y equipamiento de cocina para el barrio San Vicente.',
    category: 'social',
    status: 'active',
    proposer: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    impactGoal: 5000,
    currentPower: 1420,
    voters: [],
    createdAt: Date.now() - 86400000 * 2,
    endDate: Date.now() + 86400000 * 5,
  },
  {
    id: 'prop-2',
    title: 'Kits escolares solidarios',
    description: 'Distribución de mochilas y útiles completos para 100 niños en zonas rurales de la provincia.',
    category: 'social',
    status: 'passed',
    proposer: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    impactGoal: 3000,
    currentPower: 3250,
    voters: [
      { address: '0x123', power: 1500, timestamp: Date.now() - 400000 },
      { address: '0x456', power: 1750, timestamp: Date.now() - 200000 }
    ],
    createdAt: Date.now() - 86400000 * 10,
    endDate: Date.now() - 86400000 * 2,
  },
  {
    id: 'prop-3',
    title: 'Actualización de Fee de Red',
    description: 'Propuesta para reducir el fee de transacción en un 0.5% para incentivar el uso en comercios locales.',
    category: 'economic',
    status: 'active',
    proposer: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
    impactGoal: 10000,
    currentPower: 4560,
    voters: [],
    createdAt: Date.now() - 86400000,
    endDate: Date.now() + 86400000 * 10,
  }
];

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return INITIAL_PROPOSALS;
      
      const parsed = JSON.parse(saved);
      // Basic validation to ensure we have the new structure
      if (Array.isArray(parsed) && parsed.length > 0 && 'status' in parsed[0]) {
        return parsed;
      }
      return INITIAL_PROPOSALS;
    } catch (e) {
      console.error('Error loading proposals from localStorage', e);
      return INITIAL_PROPOSALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
    } catch (e) {
      console.error('Error saving proposals to localStorage', e);
    }
  }, [proposals]);

  const vote = useCallback((proposalId: string, walletAddress: string, power: number) => {
    setProposals(prev => {
      const updated = prev.map(p => {
        if (p.id === proposalId && !p.voters.some(v => v.address === walletAddress)) {
          const newPower = p.currentPower + power;
          let newStatus = p.status;
          
          // Auto-pass if goal reached
          if (newPower >= p.impactGoal && p.status === 'active') {
            newStatus = 'passed';
          }

          return {
            ...p,
            currentPower: newPower,
            status: newStatus,
            voters: [...p.voters, { address: walletAddress, power, timestamp: Date.now() }]
          };
        }
        return p;
      });
      return updated;
    });
  }, []);

  const createProposal = useCallback((newProp: Omit<Proposal, 'id' | 'currentPower' | 'voters' | 'createdAt' | 'status'>) => {
    const proposal: Proposal = {
      ...newProp,
      id: `prop-${Date.now()}`,
      currentPower: 0,
      voters: [],
      status: 'active',
      createdAt: Date.now(),
    };
    setProposals(prev => [proposal, ...prev]);
  }, []);

  const hasVoted = useCallback((proposalId: string, walletAddress: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    return proposal ? proposal.voters.some(v => v.address === walletAddress) : false;
  }, [proposals]);

  return (
    <CommunityContext.Provider value={{ proposals, vote, hasVoted, createProposal }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) throw new Error('useCommunity must be used within a CommunityProvider');
  return context;
};
