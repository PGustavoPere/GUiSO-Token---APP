export const GUISO_CONTRACT_ADDRESS = (import.meta as any).env?.VITE_GUISO_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const GUISO_ABI = [
  // Placeholder ABI
  "function supportCause(string causeId, uint256 amount) external returns (bool)",
  "event ImpactGenerated(address indexed user, string causeId, uint256 amount)"
];
