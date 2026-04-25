export interface GlobalImpactState {
  totalImpact: number;
  supportedCauses: number;
  communityMembers: number;
}

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

export interface Payment {
  id: string;
  merchantId: string;
  merchantName: string;
  fiatAmount: number;
  tokenAmount: number;
  status: string;
  description: string;
  createdAt: number;
  expiresAt: number;
  walletAddress: string;
  txHash?: string;
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

  async getStats(): Promise<GlobalImpactState> {
    const res = await fetch(`${API_BASE}/stats?t=${Date.now()}`);
    return handleResponse<GlobalImpactState>(res);
  },

  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects?t=${Date.now()}`);
    return handleResponse<Project[]>(res);
  },

  async getUserProfile(address: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile/${address}`);
    return handleResponse<UserProfile>(res);
  },

  async createPayment(data: Partial<Payment>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ id: string }>(res);
  },

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const res = await fetch(`${API_BASE}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<Payment>(res);
  }
};
