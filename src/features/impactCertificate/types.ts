export interface ImpactCertificate {
  id: string;
  txHash: string;
  wallet: string;
  title: string;
  impactAmount: number;
  createdAt: number;
  verificationUrl: string;
  meta?: {
    demo?: boolean;
  };
}
