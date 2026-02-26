export interface MerchantTrustProfile {
  merchantId: string; // This will be the merchant's wallet address
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalImpactGenerated: number;
  trustScore: number; // 0–100
  lastUpdated: number;
}
