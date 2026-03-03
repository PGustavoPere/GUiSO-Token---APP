import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface PaymentIntent {
  id: string;
  merchantName: string;
  description: string;
  fiatAmount: number;
  tokenAmount: number;
  walletAddress: string;
  status: 'awaiting_payment' | 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';
  createdAt: number;
  expiresAt: number;
  txHash?: string;
  simulated?: boolean;
  completedAt?: number;
}

class MockDatabase {
  private db: Database.Database;

  constructor() {
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    this.db = new Database(path.join(dbDir, 'payments.db'));
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);
  }

  getPayments(): PaymentIntent[] {
    const stmt = this.db.prepare('SELECT data FROM payments');
    const rows = stmt.all() as { data: string }[];
    return rows.map(row => JSON.parse(row.data));
  }

  getPaymentById(id: string): PaymentIntent | null {
    const stmt = this.db.prepare('SELECT data FROM payments WHERE id = ?');
    const row = stmt.get(id) as { data: string } | undefined;
    
    if (!row) return null;
    
    const payment = JSON.parse(row.data) as PaymentIntent;
    
    // Check expiration
    if (payment.status !== 'completed' && payment.status !== 'failed' && Date.now() > payment.expiresAt) {
      payment.status = 'expired';
      const stmtUpdate = this.db.prepare('UPDATE payments SET data = ? WHERE id = ?');
      stmtUpdate.run(JSON.stringify(payment), id);
    }
    
    return payment;
  }

  createPayment(data: Omit<PaymentIntent, 'id' | 'status' | 'createdAt' | 'expiresAt'>): string {
    const id = randomUUID();
    const now = Date.now();
    const payment: PaymentIntent = {
      ...data,
      id,
      status: 'awaiting_payment',
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000, // 15 minutes
    };
    
    const stmt = this.db.prepare('INSERT INTO payments (id, data) VALUES (?, ?)');
    stmt.run(id, JSON.stringify(payment));
    
    return id;
  }

  updatePayment(id: string, data: Partial<PaymentIntent>): PaymentIntent | null {
    const existing = this.getPaymentById(id);
    if (!existing) return null;
    
    const updated = { ...existing, ...data };
    const stmt = this.db.prepare('UPDATE payments SET data = ? WHERE id = ?');
    stmt.run(JSON.stringify(updated), id);
    
    return updated;
  }
}

// Singleton instance
export const mockDatabase = new MockDatabase();
