import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../payments/PaymentStore';
import { useTrustStore, calculateTrustScore } from './TrustStore';
import { useTrustSnapshotStore } from './TrustSnapshotStore';
import { PaymentIntent } from '../payments/types';
import { impactEngine } from '../../system/impactEngine';

export function AutoTrustUpdater() {
  const { payments } = usePaymentStore();
  const { updateTrustAfterPayment, getMerchantTrust } = useTrustStore();
  const { createSnapshot } = useTrustSnapshotStore();
  const [processedPayments, setProcessedPayments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('guiso_processed_trust_payments');
    if (saved) {
      setProcessedPayments(new Set(JSON.parse(saved)));
    }
  }, []);

  useEffect(() => {
    let updated = false;
    const newProcessed = new Set(processedPayments);

    const processPayments = async () => {
      for (const payment of Object.values(payments) as PaymentIntent[]) {
        if (!newProcessed.has(payment.id)) {
          if (payment.status === 'completed') {
            const impactGenerated = impactEngine.calculateImpactPoints(payment.tokenAmount);
            
            const currentProfile = getMerchantTrust(payment.walletAddress);
            const updatedProfile = {
              ...currentProfile,
              totalPayments: currentProfile.totalPayments + 1,
              successfulPayments: currentProfile.successfulPayments + 1,
              totalImpactGenerated: currentProfile.totalImpactGenerated + impactGenerated,
            };
            const newScore = calculateTrustScore(updatedProfile);

            updateTrustAfterPayment(payment.walletAddress, true, impactGenerated);
            await createSnapshot(payment.walletAddress, newScore, impactGenerated, payment.txHash);
            
            newProcessed.add(payment.id);
            updated = true;
          } else if (payment.status === 'failed') {
            const currentProfile = getMerchantTrust(payment.walletAddress);
            const updatedProfile = {
              ...currentProfile,
              totalPayments: currentProfile.totalPayments + 1,
              failedPayments: currentProfile.failedPayments + 1,
            };
            const newScore = calculateTrustScore(updatedProfile);

            updateTrustAfterPayment(payment.walletAddress, false, 0);
            await createSnapshot(payment.walletAddress, newScore, 0, payment.txHash);

            newProcessed.add(payment.id);
            updated = true;
          }
        }
      }

      if (updated) {
        setProcessedPayments(newProcessed);
        localStorage.setItem('guiso_processed_trust_payments', JSON.stringify(Array.from(newProcessed)));
      }
    };

    processPayments();
  }, [payments, updateTrustAfterPayment, getMerchantTrust, createSnapshot, processedPayments]);

  return null;
}
