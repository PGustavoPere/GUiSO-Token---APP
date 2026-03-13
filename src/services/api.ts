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
  walletAddress: string;
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

async function handleResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type');
  if (res.ok && contentType && contentType.includes('application/json')) {
    return res.json();
  }
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  
  throw new Error('Received non-JSON response from API');
}

export const api = {
  async getTokenStats(): Promise<TokenStats> {
    const res = await fetch(`${API_BASE}/token/stats`);
    return handleResponse<TokenStats>(res);
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    return handleResponse<Project[]>(res);
  },

  async getUserProfile(address: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile/${address}`);
    return handleResponse<UserProfile>(res);
  },
};
