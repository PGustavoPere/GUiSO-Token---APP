export type ProposalStatus = 'active' | 'passed' | 'rejected' | 'executed';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'social' | 'technical' | 'economic' | 'governance';
  status: ProposalStatus;
  proposer: string;
  impactGoal: number; // Threshold to pass (in voting power)
  currentPower: number; // Total voting power accumulated
  voters: {
    address: string;
    power: number;
    timestamp: number;
  }[];
  createdAt: number;
  endDate: number;
}
