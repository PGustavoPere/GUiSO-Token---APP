import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ImpactIdentity } from './identityTypes';

interface IdentityContextType {
  identities: Record<string, ImpactIdentity>;
  createIdentity: (wallet: string) => void;
  updateAfterImpact: (wallet: string, impactPoints: number, hasCertificate: boolean) => void;
  getIdentity: (wallet: string) => ImpactIdentity;
}

const IdentityContext = createContext<IdentityContextType | undefined>(undefined);

const calculateLevelAndTitle = (totalImpact: number): { level: number; title: string } => {
  if (totalImpact <= 100) return { level: 1, title: 'Supporter' };
  if (totalImpact <= 500) return { level: 2, title: 'Contributor' };
  if (totalImpact <= 1500) return { level: 3, title: 'Impact Builder' };
  if (totalImpact <= 5000) return { level: 4, title: 'Community Pillar' };
  return { level: 5, title: 'Humanitarian Catalyst' };
};

export const IdentityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [identities, setIdentities] = useState<Record<string, ImpactIdentity>>({});

  useEffect(() => {
    const saved = localStorage.getItem('guiso_identities');
    if (saved) {
      setIdentities(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guiso_identities', JSON.stringify(identities));
  }, [identities]);

  const createIdentity = useCallback((wallet: string) => {
    setIdentities(prev => {
      if (prev[wallet]) return prev;
      return {
        ...prev,
        [wallet]: {
          wallet,
          totalImpact: 0,
          totalPayments: 0,
          certificatesEarned: 0,
          impactLevel: 1,
          title: 'Supporter',
          createdAt: Date.now(),
          lastActive: Date.now()
        }
      };
    });
  }, []);

  const updateAfterImpact = useCallback((wallet: string, impactPoints: number, hasCertificate: boolean) => {
    setIdentities(prev => {
      const current = prev[wallet] || {
        wallet,
        totalImpact: 0,
        totalPayments: 0,
        certificatesEarned: 0,
        impactLevel: 1,
        title: 'Supporter',
        createdAt: Date.now(),
        lastActive: Date.now()
      };

      const newTotalImpact = current.totalImpact + impactPoints;
      const { level, title } = calculateLevelAndTitle(newTotalImpact);

      return {
        ...prev,
        [wallet]: {
          ...current,
          totalImpact: newTotalImpact,
          totalPayments: current.totalPayments + 1,
          certificatesEarned: current.certificatesEarned + (hasCertificate ? 1 : 0),
          impactLevel: level,
          title,
          lastActive: Date.now()
        }
      };
    });
  }, []);

  const getIdentity = useCallback((wallet: string): ImpactIdentity => {
    return identities[wallet] || {
      wallet,
      totalImpact: 0,
      totalPayments: 0,
      certificatesEarned: 0,
      impactLevel: 1,
      title: 'Supporter',
      createdAt: Date.now(),
      lastActive: Date.now()
    };
  }, [identities]);

  return (
    <IdentityContext.Provider value={{ identities, createIdentity, updateAfterImpact, getIdentity }}>
      {children}
    </IdentityContext.Provider>
  );
};

export const useIdentityStore = () => {
  const context = useContext(IdentityContext);
  if (!context) throw new Error('useIdentityStore must be used within an IdentityProvider');
  return context;
};
