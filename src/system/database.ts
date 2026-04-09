import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'guiso.db');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    merchantId TEXT,
    merchantName TEXT,
    fiatAmount REAL,
    tokenAmount INTEGER,
    status TEXT,
    description TEXT,
    createdAt INTEGER,
    expiresAt INTEGER,
    walletAddress TEXT,
    txHash TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    status TEXT,
    raised INTEGER,
    goal INTEGER,
    image TEXT,
    category TEXT,
    walletAddress TEXT
  );
`);

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

export interface ProjectRecord {
  id: string;
  title: string;
  description: string;
  status: string;
  raised: number;
  goal: number;
  image: string;
  category: string;
  walletAddress: string;
}

export const projectRepo = {
  getAll: (): ProjectRecord[] => {
    return db.prepare('SELECT * FROM projects').all() as ProjectRecord[];
  },
  
  getById: (id: string): ProjectRecord | undefined => {
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRecord | undefined;
  },
  
  create: (project: ProjectRecord) => {
    const stmt = db.prepare(`
      INSERT INTO projects (id, title, description, status, raised, goal, image, category, walletAddress)
      VALUES (@id, @title, @description, @status, @raised, @goal, @image, @category, @walletAddress)
    `);
    stmt.run(project);
    return project;
  },
  
  incrementRaised: (id: string, amount: number) => {
    const stmt = db.prepare('UPDATE projects SET raised = raised + ? WHERE id = ?');
    stmt.run(amount, id);
  }
};

export const paymentRepo = {
  getAll: (): PaymentRecord[] => {
    return db.prepare('SELECT * FROM payments ORDER BY createdAt DESC').all() as PaymentRecord[];
  },
  
  getById: (id: string): PaymentRecord | undefined => {
    return db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as PaymentRecord | undefined;
  },
  
  create: (payment: PaymentRecord) => {
    const stmt = db.prepare(`
      INSERT INTO payments (id, merchantId, merchantName, fiatAmount, tokenAmount, status, description, createdAt, expiresAt, walletAddress)
      VALUES (@id, @merchantId, @merchantName, @fiatAmount, @tokenAmount, @status, @description, @createdAt, @expiresAt, @walletAddress)
    `);
    stmt.run(payment);
    return payment;
  },
  
  update: (id: string, updates: Partial<PaymentRecord>) => {
    const current = paymentRepo.getById(id);
    if (!current) return undefined;
    
    const updated = { ...current, ...updates };
    const stmt = db.prepare(`
      UPDATE payments 
      SET status = @status, txHash = @txHash
      WHERE id = @id
    `);
    stmt.run({
      status: updated.status,
      txHash: updated.txHash || null,
      id
    });
    return updated;
  }
};

export default db;
