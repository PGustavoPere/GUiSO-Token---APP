import { create } from 'zustand';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  endDate: string;
  author: string;
}

interface CommunityState {
  proposals: Proposal[];
  userVotes: Record<string, 'for' | 'against'>; // proposalId -> vote
  vote: (proposalId: string, voteType: 'for' | 'against', votingPower: number) => void;
}

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    title: 'Financiar Comedor "Los Pibes" en Buenos Aires',
    description: 'Propuesta para destinar 50,000 GSO del fondo comunitario para asegurar 3 meses de alimentos en el comedor "Los Pibes", que atiende a 150 niños diariamente.',
    status: 'active',
    votesFor: 12500,
    votesAgainst: 450,
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    author: '0x71C...976F'
  },
  {
    id: 'prop-2',
    title: 'Aumentar multiplicador de Impact Points (IP) en Q3',
    description: 'Incrementar el multiplicador base de IP de 1.0x a 1.2x durante el tercer trimestre para incentivar mayores donaciones durante los meses de invierno.',
    status: 'active',
    votesFor: 8900,
    votesAgainst: 2100,
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    author: '0x33A...112B'
  },
  {
    id: 'prop-3',
    title: 'Asociación con Cruz Roja Internacional',
    description: 'Aprobar la integración técnica y legal para que la Cruz Roja pueda recibir donaciones directas en GSO a través de nuestra plataforma.',
    status: 'passed',
    votesFor: 45000,
    votesAgainst: 1200,
    endDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    author: '0x99F...44E1'
  }
];

export const useCommunityStore = create<CommunityState>((set) => ({
  proposals: MOCK_PROPOSALS,
  userVotes: {},
  vote: (proposalId, voteType, votingPower) => set((state) => {
    // Prevent double voting
    if (state.userVotes[proposalId]) return state;

    const updatedProposals = state.proposals.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          votesFor: voteType === 'for' ? p.votesFor + votingPower : p.votesFor,
          votesAgainst: voteType === 'against' ? p.votesAgainst + votingPower : p.votesAgainst,
        };
      }
      return p;
    });

    return {
      proposals: updatedProposals,
      userVotes: { ...state.userVotes, [proposalId]: voteType }
    };
  })
}));
