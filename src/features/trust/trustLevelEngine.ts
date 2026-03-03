import { t } from '../../i18n';

export type TrustLevel = 'unverified' | 'verified' | 'trusted' | 'elite';

export interface TrustLevelMeta {
  level: TrustLevel;
  label: string;
  color: string;
  icon: string;
  minScore: number;
  priority: number;
}

export const TRUST_LEVELS: Record<TrustLevel, TrustLevelMeta> = {
  unverified: { level: 'unverified', label: 'Unverified', color: 'text-gray-500', icon: 'ShieldAlert', minScore: 0, priority: 0 },
  verified: { level: 'verified', label: 'Verified', color: 'text-blue-500', icon: 'Shield', minScore: 50, priority: 1 },
  trusted: { level: 'trusted', label: 'Trusted', color: 'text-green-500', icon: 'ShieldCheck', minScore: 80, priority: 2 },
  elite: { level: 'elite', label: 'Elite', color: 'text-purple-500', icon: 'Award', minScore: 95, priority: 3 },
};

export const getTrustLevel = (score: number): TrustLevel => {
  if (score >= 95) return 'elite';
  if (score >= 80) return 'trusted';
  if (score >= 50) return 'verified';
  return 'unverified';
};

export const getTrustLevelMeta = (level: TrustLevel): TrustLevelMeta => {
  return TRUST_LEVELS[level];
};
