import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TrustSnapshot } from './trustSnapshotTypes';

interface TrustSnapshotContextType {
  snapshots: Record<string, TrustSnapshot>;
  createSnapshot: (merchantId: string, trustScore: number, impactGenerated: number, txHash?: string) => Promise<TrustSnapshot>;
  getSnapshotByTxHash: (txHash: string) => TrustSnapshot | null;
}

const TrustSnapshotContext = createContext<TrustSnapshotContextType | undefined>(undefined);

export const TrustSnapshotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshots, setSnapshots] = useState<Record<string, TrustSnapshot>>({});

  useEffect(() => {
    const saved = localStorage.getItem('guiso_trust_snapshots');
    if (saved) {
      setSnapshots(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guiso_trust_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const createSnapshot = useCallback(async (merchantId: string, trustScore: number, impactGenerated: number, txHash?: string) => {
    const timestamp = Date.now();
    const data = `${merchantId}${trustScore}${impactGenerated}${timestamp}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const proofHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const snapshot: TrustSnapshot = {
      id: `SNAP-${timestamp}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      merchantId,
      trustScore,
      impactGenerated,
      timestamp,
      txHash,
      proofHash
    };

    setSnapshots(prev => ({ ...prev, [snapshot.id]: snapshot }));
    return snapshot;
  }, []);

  const getSnapshotByTxHash = useCallback((txHash: string) => {
    return (Object.values(snapshots) as TrustSnapshot[]).find(s => s.txHash === txHash) || null;
  }, [snapshots]);

  return (
    <TrustSnapshotContext.Provider value={{ snapshots, createSnapshot, getSnapshotByTxHash }}>
      {children}
    </TrustSnapshotContext.Provider>
  );
};

export const useTrustSnapshotStore = () => {
  const context = useContext(TrustSnapshotContext);
  if (!context) throw new Error('useTrustSnapshotStore must be used within a TrustSnapshotProvider');
  return context;
};
