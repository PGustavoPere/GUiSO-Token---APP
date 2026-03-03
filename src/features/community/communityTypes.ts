export interface Proposal {
  id: string;
  title: string;
  description: string;
  impactGoal: number;
  votes: number;
  voters: string[];
  createdAt: number;
}
