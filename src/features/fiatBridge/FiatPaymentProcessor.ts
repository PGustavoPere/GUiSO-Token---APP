import { useState, useEffect } from 'react';
import { useFiatBridgeStore } from './FiatBridgeStore';
import { usePaymentStore } from '../payments/PaymentStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { web3Bridge } from '../../web3/web3Provider';
import { FiatPaymentStatus } from './fiatTypes';

export const useFiatPaymentProcessor = (paymentIntentId?: string) => {
  const { createFiatPayment, updateStatus, markCompleted, getPaymentByIntentId } = useFiatBridgeStore();
  const { loadPaymentIntent, updateStatus: updatePaymentStatus, attachTransaction, markCompleted: markPaymentCompleted } = usePaymentStore();
  const { recordSupportTransaction, user } = useGuisoCore();
  
  const [currentStatus, setCurrentStatus] = useState<FiatPaymentStatus>('created');
  const [error, setError] = useState<string | null>(null);

  // Recovery logic
  useEffect(() => {
    if (paymentIntentId) {
      const existingFiatPayment = getPaymentByIntentId(paymentIntentId);
      if (existingFiatPayment) {
        if (['processing', 'converting', 'sending_tokens'].includes(existingFiatPayment.status)) {
          // If it was stuck in a transient state, mark it as failed so user can retry
          updateStatus(existingFiatPayment.id, 'failed');
          setCurrentStatus('failed');
          setError('El pago fue interrumpido. Por favor, intenta nuevamente.');
        } else {
          setCurrentStatus(existingFiatPayment.status);
        }
      }
    }
  }, [paymentIntentId, getPaymentByIntentId, updateStatus]);

  const processPayment = async (intentId: string, arsAmount: number) => {
    setError(null);
    setCurrentStatus('processing');
    
    try {
      if (!user.isWalletConnected) {
        throw new Error('Por favor conecta tu wallet primero para registrar el impacto en la blockchain');
      }

      const paymentIntent = loadPaymentIntent(intentId);
      
      if (!paymentIntent) {
        throw new Error('Payment intent not found');
      }

      if (paymentIntent.status === 'expired') {
        throw new Error('El enlace de pago ha expirado');
      }

      if (paymentIntent.status === 'completed' || paymentIntent.status === 'pending' || paymentIntent.status === 'confirming') {
        throw new Error('Este pago ya está siendo procesado o fue completado');
      }

      const fiatPaymentId = createFiatPayment(intentId, arsAmount);

      // Step 1: Processing
      updateStatus(fiatPaymentId, 'processing');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Converting
      setCurrentStatus('converting');
      updateStatus(fiatPaymentId, 'converting');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Sending tokens
      setCurrentStatus('sending_tokens');
      updateStatus(fiatPaymentId, 'sending_tokens');
      updatePaymentStatus(intentId, 'pending');

      const transactionAdapter = web3Bridge.getTransaction();
      const result = await transactionAdapter.sendTransaction(
        paymentIntent.tokenAmount, 
        `Fiat Payment to ${paymentIntent.merchantName}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      attachTransaction(intentId, result.txHash);

      // Step 4: Wait for confirmation with timeout simulation
      const confirmationPromise = transactionAdapter.waitForTransaction(result.txHash);
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Tiempo de espera agotado (60s)')), 60000);
      });

      const confirmed = await Promise.race([confirmationPromise, timeoutPromise]);

      if (confirmed) {
        // Step 5: Completed
        setCurrentStatus('completed');
        updateStatus(fiatPaymentId, 'completed');
        markCompleted(fiatPaymentId);
        
        markPaymentCompleted(intentId);
        recordSupportTransaction(
          intentId, 
          `Pago: ${paymentIntent.merchantName}`, 
          paymentIntent.tokenAmount, 
          result.txHash,
          paymentIntent.meta
        );
      } else {
        throw new Error('Transaction could not be confirmed');
      }
    } catch (err: any) {
      setCurrentStatus('failed');
      setError(err.message || 'An unexpected error occurred');
    }
  };

  return {
    processPayment,
    currentStatus,
    error
  };
};
