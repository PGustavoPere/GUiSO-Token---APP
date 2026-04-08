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
  )
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
