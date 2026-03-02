import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MerchantTrustProfile } from './trustTypes';
import { usePaymentStore } from '../payments/PaymentStore';

interface TrustContextType {
  profiles: Record<string, MerchantTrustProfile>;
  updateTrustAfterPayment: (merchantId: string, success: boolean, impactGenerated?: number) => void;
  getMerchantTrust: (merchantId: string) => MerchantTrustProfile;
  getTrustByTxHash: (txHash: string) => MerchantTrustProfile | null;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export const calculateTrustScore = (profile: MerchantTrustProfile): number => {
  if (profile.totalPayments === 0) return 50; // Default starting score

  const successRate = profile.successfulPayments / profile.totalPayments;
  
  // Simple impact volume weight: caps at 1000 impact points for max weight
  const impactVolumeWeight = Math.min(profile.totalImpactGenerated / 1000, 1);

  // Formula: successRate * 70 + impactVolumeWeight * 30
  let score = (successRate * 70) + (impactVolumeWeight * 30);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const TrustProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Record<string, MerchantTrustProfile>>({});
  const { payments } = usePaymentStore();

  useEffect(() => {
    const saved = localStorage.getItem('guiso_trust_profiles');
    if (saved) {
      setProfiles(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guiso_trust_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const updateTrustAfterPayment = useCallback((merchantId: string, success: boolean, impactGenerated: number = 0) => {
    setProfiles(prev => {
      const current = prev[merchantId] || {
        merchantId,
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        totalImpactGenerated: 0,
        trustScore: 50,
        lastUpdated: Date.now()
      };

      const updated = {
        ...current,
        totalPayments: current.totalPayments + 1,
        successfulPayments: current.successfulPayments + (success ? 1 : 0),
        failedPayments: current.failedPayments + (success ? 0 : 1),
        totalImpactGenerated: current.totalImpactGenerated + impactGenerated,
        lastUpdated: Date.now()
      };

      updated.trustScore = calculateTrustScore(updated);

      return { ...prev, [merchantId]: updated };
    });
  }, []);

  const getMerchantTrust = useCallback((merchantId: string): MerchantTrustProfile => {
    return profiles[merchantId] || {
      merchantId,
      totalPayments: 0,
      successfulPayments: 0,
      failedPayments: 0,
      totalImpactGenerated: 0,
      trustScore: 50, // Default starting score
      lastUpdated: Date.now()
    };
  }, [profiles]);

  const getTrustByTxHash = useCallback((txHash: string): MerchantTrustProfile | null => {
    const payment = (Object.values(payments) as any[]).find(p => p.txHash === txHash);
    if (payment) {
      return getMerchantTrust(payment.walletAddress);
    }
    return null;
  }, [payments, getMerchantTrust]);

  return (
    <TrustContext.Provider value={{ profiles, updateTrustAfterPayment, getMerchantTrust, getTrustByTxHash }}>
      {children}
    </TrustContext.Provider>
  );
};

export const useTrustStore = () => {
  const context = useContext(TrustContext);
  if (!context) throw new Error('useTrustStore must be used within a TrustProvider');
  return context;
};
