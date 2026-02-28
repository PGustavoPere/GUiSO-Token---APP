import React, { useEffect, useRef } from 'react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { impactCertificateService } from './impactCertificateService';
import { useImpactExplorerStore } from '../impactExplorer/ImpactExplorerStore';

export function AutoCertificateGenerator() {
  const { token, user } = useGuisoCore();
  const { addImpactEvent } = useImpactExplorerStore();
  
  // Initialize with existing demo transactions to avoid recreating demo certificates on reload
  const processedTxHashes = useRef<Set<string>>(new Set(
    token.transactions.filter(tx => tx.meta?.demo).map(tx => tx.txHash).filter(Boolean) as string[]
  ));

  useEffect(() => {
    if (!user.walletAddress) return;
    
    const existingCerts = impactCertificateService.getAllCertificates();
    const existingTxHashes = new Set(existingCerts.map(c => c.txHash));
    
    let generated = false;
    token.transactions.forEach(tx => {
      if (tx.txHash && !existingTxHashes.has(tx.txHash) && !processedTxHashes.current.has(tx.txHash)) {
        processedTxHashes.current.add(tx.txHash);
        const cert = impactCertificateService.generateCertificate(
          tx.txHash,
          user.walletAddress!,
          tx.target,
          tx.impactPoints,
          tx.meta
        );
        addImpactEvent({
          id: `EVT-${cert.id}`,
          certificateId: cert.id,
          title: cert.title,
          impactAmount: cert.impactAmount,
          timestamp: cert.createdAt,
          walletShort: `${cert.wallet.slice(0, 6)}...${cert.wallet.slice(-4)}`,
          txHash: cert.txHash,
          meta: tx.meta
        });
        generated = true;
      }
    });

    if (generated) {
      window.dispatchEvent(new Event('certificates_updated'));
    }
  }, [token.transactions, user.walletAddress, addImpactEvent]);

  return null;
}
