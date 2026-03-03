import { useState } from 'react';
import { useFiatBridgeStore } from './FiatBridgeStore';
import { usePaymentStore } from '../payments/PaymentStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { web3Bridge } from '../../web3/web3Provider';
import { FiatPaymentStatus } from './fiatTypes';

export const useFiatPaymentProcessor = () => {
  const { createFiatPayment, updateStatus, markCompleted } = useFiatBridgeStore();
  const { recordSupportTransaction, user } = useGuisoCore();
  
  const [currentStatus, setCurrentStatus] = useState<FiatPaymentStatus>('created');
  const [error, setError] = useState<string | null>(null);

  const updatePaymentStatus = async (id: string, status: string, txHash?: string) => {
    try {
      await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(txHash ? { txHash } : {}) })
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const processPayment = async (paymentIntentId: string, arsAmount: number) => {
    setError(null);
    setCurrentStatus('processing');
    
    try {
      if (!user.isWalletConnected) {
        throw new Error('Por favor conecta tu wallet primero para registrar el impacto en la blockchain');
      }

      const res = await fetch(`/api/payments/${paymentIntentId}`);
      if (!res.ok) {
        throw new Error('Payment intent not found');
      }
      const paymentIntent = await res.json();

      if (paymentIntent.status === 'expired') {
        throw new Error('El enlace de pago ha expirado');
      }

      if (paymentIntent.status === 'completed' || paymentIntent.status === 'pending' || paymentIntent.status === 'confirming') {
        throw new Error('Este pago ya está siendo procesado o fue completado');
      }

      const fiatPaymentId = createFiatPayment(paymentIntentId, arsAmount);

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
      await updatePaymentStatus(paymentIntentId, 'pending');

      const transactionAdapter = web3Bridge.getTransaction();
      const result = await transactionAdapter.sendTransaction(
        paymentIntent.tokenAmount, 
        `Fiat Payment to ${paymentIntent.merchantName}`
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      await updatePaymentStatus(paymentIntentId, 'confirming', result.txHash);

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
        
        await updatePaymentStatus(paymentIntentId, 'completed');
        recordSupportTransaction(
          paymentIntentId, 
          `Pago: ${paymentIntent.merchantName}`, 
          paymentIntent.tokenAmount, 
          result.txHash
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
