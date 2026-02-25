import React, { useEffect } from 'react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { impactCertificateService } from './impactCertificateService';

export function AutoCertificateGenerator() {
  const { token, user } = useGuisoCore();

  useEffect(() => {
    if (!user.walletAddress) return;
    
    const existingCerts = impactCertificateService.getAllCertificates();
    const existingTxHashes = new Set(existingCerts.map(c => c.txHash));
    
    let generated = false;
    token.transactions.forEach(tx => {
      if (tx.txHash && !existingTxHashes.has(tx.txHash)) {
        impactCertificateService.generateCertificate(
          tx.txHash,
          user.walletAddress!,
          tx.target,
          tx.impactPoints
        );
        generated = true;
      }
    });

    if (generated) {
      window.dispatchEvent(new Event('certificates_updated'));
    }
  }, [token.transactions, user.walletAddress]);

  return null;
}
