export interface TrustSnapshot {
  id: string;
  merchantId: string;
  trustScore: number;
  impactGenerated: number;
  timestamp: number;
  txHash?: string;
  proofHash: string;
}
