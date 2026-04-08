import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'payments.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

export interface PaymentRecord {
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

const readData = (): PaymentRecord[] => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading payments.json:', err);
    return [];
  }
};

const writeData = (data: PaymentRecord[]) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing payments.json:', err);
  }
};

export const paymentRepo = {
  getAll: (): PaymentRecord[] => {
    return readData().sort((a, b) => b.createdAt - a.createdAt);
  },
  
  getById: (id: string): PaymentRecord | undefined => {
    return readData().find(p => p.id === id);
  },
  
  create: (payment: PaymentRecord) => {
    const data = readData();
    data.push(payment);
    writeData(data);
    return payment;
  },
  
  update: (id: string, updates: Partial<PaymentRecord>) => {
    const data = readData();
    const index = data.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    data[index] = { ...data[index], ...updates };
    writeData(data);
    return data[index];
  }
};

export default { dbPath };
