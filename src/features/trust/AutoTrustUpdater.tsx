import React, { useEffect, useState } from 'react';
import { usePaymentStore } from '../payments/PaymentStore';
import { useTrustStore } from './TrustStore';
import { PaymentIntent } from '../payments/types';
import { impactEngine } from '../../system/impactEngine';

export function AutoTrustUpdater() {
  const { payments } = usePaymentStore();
  const { updateTrustAfterPayment } = useTrustStore();
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

    Object.values(payments).forEach((payment: PaymentIntent) => {
      if (!newProcessed.has(payment.id)) {
        if (payment.status === 'completed') {
          const impactGenerated = impactEngine.calculateImpactPoints(payment.tokenAmount);
          updateTrustAfterPayment(payment.walletAddress, true, impactGenerated);
          newProcessed.add(payment.id);
          updated = true;
        } else if (payment.status === 'failed') {
          updateTrustAfterPayment(payment.walletAddress, false, 0);
          newProcessed.add(payment.id);
          updated = true;
        }
      }
    });

    if (updated) {
      setProcessedPayments(newProcessed);
      localStorage.setItem('guiso_processed_trust_payments', JSON.stringify(Array.from(newProcessed)));
    }
  }, [payments, updateTrustAfterPayment, processedPayments]);

  return null;
}
