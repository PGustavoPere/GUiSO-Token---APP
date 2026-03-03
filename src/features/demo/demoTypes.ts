export interface DemoSession {
  id: string;
  startedAt: number;
  demoMerchantId?: string;
  demoPaymentId?: string;
  completed?: boolean;
}
