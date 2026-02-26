import React, { useEffect, useState } from 'react';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useIdentityStore } from './IdentityStore';

export function AutoIdentityUpdater() {
  const { token, user } = useGuisoCore();
  const { updateAfterImpact } = useIdentityStore();
  const [processedTx, setProcessedTx] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('guiso_processed_identity_tx');
    if (saved) {
      setProcessedTx(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    if (!user.walletAddress) return;

    let updated = false;
    const newProcessed = new Set(processedTx);

    token.transactions.forEach(tx => {
      if (tx.txHash && !newProcessed.has(tx.txHash)) {
        // We assume every support transaction generates a certificate
        const hasCertificate = tx.type === 'support';
        updateAfterImpact(user.walletAddress!, tx.impactPoints, hasCertificate);
        newProcessed.add(tx.txHash);
        updated = true;
      }
    });

    if (updated) {
      setProcessedTx(newProcessed);
      localStorage.setItem('guiso_processed_identity_tx', JSON.stringify(Array.from(newProcessed)));
    }
  }, [token.transactions, user.walletAddress, updateAfterImpact, processedTx]);

  return null;
}
