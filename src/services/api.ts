export interface TokenStats {
  price: number;
  priceChange24h: number;
  circulatingSupply: number;
  totalSupply: number;
  holders: number;
  marketCap: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  raised: number;
  goal: number;
  image: string;
  category: string;
}

export interface UserProfile {
  address: string;
  balance: number;
  impactPoints: number;
  history: Array<{
    id: string;
    type: string;
    project?: string;
    amount?: number;
    date: string;
  }>;
}

const API_BASE = '/api';

export const api = {
  async getTokenStats(): Promise<TokenStats> {
    const res = await fetch(`${API_BASE}/token/stats`);
    return res.json();
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return res.json();
  },

  async getUserProfile(address: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile/${address}`);
    return res.json();
  },
};
