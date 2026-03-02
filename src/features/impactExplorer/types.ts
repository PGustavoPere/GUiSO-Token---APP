export interface ImpactEvent {
  id: string;
  certificateId: string;
  title: string;
  impactAmount: number;
  timestamp: number;
  walletShort: string;
  txHash: string;
}
