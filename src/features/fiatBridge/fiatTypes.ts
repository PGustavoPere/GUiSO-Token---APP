export type FiatPaymentStatus = 
  | 'created'
  | 'processing'
  | 'converting'
  | 'sending_tokens'
  | 'completed'
  | 'failed';

export interface FiatPayment {
  id: string;
  paymentIntentId: string;
  fiatAmount: number;
  currency: 'ARS';
  conversionRate: number;
  tokenAmount: number;
  status: FiatPaymentStatus;
  createdAt: number;
  completedAt?: number;
}
