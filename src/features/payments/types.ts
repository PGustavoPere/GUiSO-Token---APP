export type PaymentStatus =
  | 'created'
  | 'awaiting_payment'
  | 'pending'
  | 'confirming'
  | 'completed'
  | 'failed'
  | 'expired';

export interface PaymentIntent {
  id: string;
  merchantName: string;
  description: string;
  fiatAmount: number;
  tokenAmount: number;
  walletAddress: string;
  status: PaymentStatus;
  createdAt: number;
  expiresAt: number;
  txHash?: string;
}
