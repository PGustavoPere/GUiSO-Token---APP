import React, { useEffect } from 'react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { impactCertificateService } from './impactCertificateService';
import { useImpactExplorerStore } from '../impactExplorer/ImpactExplorerStore';

export function AutoCertificateGenerator() {
  const { token, user } = useGuisoCore();
  const { addImpactEvent } = useImpactExplorerStore();

  useEffect(() => {
    if (!user.walletAddress) return;
    
    const existingCerts = impactCertificateService.getAllCertificates();
    const existingTxHashes = new Set(existingCerts.map(c => c.txHash));
    
    let generated = false;
    token.transactions.forEach(tx => {
      if (tx.txHash && !existingTxHashes.has(tx.txHash)) {
        const cert = impactCertificateService.generateCertificate(
          tx.txHash,
          user.walletAddress!,
          tx.target,
          tx.impactPoints
        );
        addImpactEvent({
          id: `EVT-${cert.id}`,
          certificateId: cert.id,
          title: cert.title,
          impactAmount: cert.impactAmount,
          timestamp: cert.createdAt,
          walletShort: `${cert.wallet.slice(0, 6)}...${cert.wallet.slice(-4)}`,
          txHash: cert.txHash
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
