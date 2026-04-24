import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Store, Wallet, CheckCircle2, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { usePaymentStore } from './PaymentStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useWallet } from '../../core/WalletProvider';
import { web3Bridge } from '../../web3/web3Provider';
import { Card, Button } from '../../components/ui';
import TransactionStatusBadge, { TransactionStatus } from '../../components/TransactionStatusBadge';
import FiatPaymentModal from '../fiatBridge/FiatPaymentModal';
import { db, handleFirestoreError } from '../../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { recordSupportTransaction, user, token } = useGuisoCore();
  const { connect, isConnecting } = useWallet();
  
  const [payment, setPayment] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!paymentId) return;

    let retryCount = 0;
    const maxRetries = 3;

    const attemptFetch = () => {
      const normalizedId = paymentId.toLowerCase();
      
      // Track what we're currently trying to fetch
      let currentId = retryCount === 0 ? paymentId : normalizedId;
      console.log(`PaymentPage: Checking for payment ${currentId} (Attempt ${retryCount + 1})`);

      const unsub = onSnapshot(doc(db, 'payments', currentId), (docSnap) => {
        if (docSnap.exists()) {
          console.log(`PaymentPage: Payment ${currentId} found in Firestore`);
          setPayment(docSnap.data());
          setIsLoading(false);
        } else {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(attemptFetch, 1500);
            return;
          }

          // Final fallback: try API with both cases
          const tryApi = async (id: string) => {
            const res = await fetch(`${window.location.origin}/api/payments/${id}`);
            if (res.ok) return res.json();
            throw new Error("404");
          };

          tryApi(paymentId)
            .catch(() => tryApi(normalizedId))
            .then(data => {
              console.log(`PaymentPage: Payment found via API`);
              setPayment(data);
              setIsLoading(false);
            })
            .catch(() => {
              console.error(`PaymentPage: Payment not found anywhere`);
              setPayment(null);
              setIsLoading(false);
            });
        }
      }, (error) => {
        console.error('Firestore snapshot error:', error);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptFetch, 1000);
        } else {
          setIsLoading(false);
        }
      });

      return unsub;
    };

    const unsubscribe = attemptFetch();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [paymentId]);

  const updatePaymentStatus = async (id: string, status: string, txHash?: string) => {
    try {
      // Update Firestore directly
      await updateDoc(doc(db, 'payments', id), {
        status,
        ...(txHash ? { txHash } : {})
      });
      
      // Also notify the server for record keeping (optional)
      fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(txHash ? { txHash } : {}) })
      }).catch(err => console.error('Silent error updating server:', err));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  // Resume pending transaction on reload
  useEffect(() => {
    let isMounted = true;
    const resumeTransaction = async () => {
      if (payment?.status === 'confirming' && payment.txHash) {
        try {
          const transactionAdapter = web3Bridge.getTransaction();
          const confirmed = await transactionAdapter.waitForTransaction(payment.txHash);
          
          if (!isMounted) return;

          if (confirmed) {
            await updatePaymentStatus(payment.id, 'completed');
            recordSupportTransaction(payment.id, `Pago: ${payment.merchantName}`, payment.tokenAmount, payment.txHash, 'Comercio');
          } else {
            await updatePaymentStatus(payment.id, 'failed');
            setErrorMsg('La transacción no pudo ser confirmada.');
            setTimeout(() => {
              if (isMounted) updatePaymentStatus(payment.id, 'awaiting_payment');
            }, 3000);
          }
        } catch (err: any) {
          if (!isMounted) return;
          await updatePaymentStatus(payment.id, 'failed');
          setErrorMsg(err.message || 'Ocurrió un error inesperado');
          setTimeout(() => {
            if (isMounted) updatePaymentStatus(payment.id, 'awaiting_payment');
          }, 3000);
        }
      }
    };

    resumeTransaction();
    return () => { isMounted = false; };
  }, [payment?.status, payment?.txHash, payment?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="glass" padding="lg" className="text-center max-w-md w-full">
          <div className="w-12 h-12 border-4 border-guiso-orange/30 border-t-guiso-orange rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Cargando...</h2>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="glass" padding="lg" className="text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Pago no encontrado</h2>
          <p className="text-gray-500 mb-6">El enlace de pago es inválido o ha expirado.</p>
          <Button onClick={() => navigate('/')}>Volver al Inicio</Button>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!user.isWalletConnected) return;
    if (token.gsoBalance < payment.tokenAmount) {
      setErrorMsg('Balance insuficiente de tokens GUISO.');
      return;
    }
    if (payment.status === 'completed' || payment.status === 'confirming' || payment.status === 'pending') {
      return;
    }

    setErrorMsg(null);
    await updatePaymentStatus(payment.id, 'pending');
    
    try {
      const transactionAdapter = web3Bridge.getTransaction();
      const result = await transactionAdapter.sendTransaction(payment.tokenAmount, `Pago a ${payment.merchantName}`);
      
      if (!result.success) {
        await updatePaymentStatus(payment.id, 'failed');
        setErrorMsg(result.error || 'La transacción falló.');
        setTimeout(() => updatePaymentStatus(payment.id, 'awaiting_payment'), 3000);
        return;
      }
      
      await updatePaymentStatus(payment.id, 'confirming', result.txHash);
      
      const confirmed = await transactionAdapter.waitForTransaction(result.txHash);
      
      if (confirmed) {
        await updatePaymentStatus(payment.id, 'completed');
        recordSupportTransaction(payment.id, `Pago: ${payment.merchantName}`, payment.tokenAmount, result.txHash, 'Comercio');
      } else {
        await updatePaymentStatus(payment.id, 'failed');
        setErrorMsg('La transacción no pudo ser confirmada.');
        setTimeout(() => updatePaymentStatus(payment.id, 'awaiting_payment'), 3000);
      }
    } catch (err: any) {
      await updatePaymentStatus(payment.id, 'failed');
      setErrorMsg(err.message || 'Ocurrió un error inesperado');
      setTimeout(() => updatePaymentStatus(payment.id, 'awaiting_payment'), 3000);
    }
  };

  const handleSimulatePayment = async () => {
    if (isProcessing || isCompleted) return;
    
    setErrorMsg(null);
    await updatePaymentStatus(payment.id, 'pending');
    
    setTimeout(async () => {
      await updatePaymentStatus(payment.id, 'confirming', '0x_simulated_tx_hash_' + Date.now());
      
      setTimeout(async () => {
        await updatePaymentStatus(payment.id, 'completed');
        // We don't recordSupportTransaction here because the user might not be connected on the mobile device
        // and we want the merchant to see the payment regardless.
      }, 2000);
    }, 2000);
  };

  const mapStatusToTxStatus = (): TransactionStatus => {
    switch (payment.status) {
      case 'pending': return 'pending';
      case 'confirming': return 'confirming';
      case 'completed': return 'confirmed';
      case 'failed': return 'failed';
      default: return 'idle';
    }
  };

  const isExpired = payment.status === 'expired';
  const isCompleted = payment.status === 'completed';
  const isProcessing = payment.status === 'pending' || payment.status === 'confirming';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <Card variant="glass" padding="lg" className="shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-guiso-orange/10 text-guiso-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <Store size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-guiso-dark">{payment.merchantName}</h1>
            <p className="text-gray-500 mt-1">{payment.description}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total a pagar</span>
              <span className="text-2xl font-bold text-guiso-dark">${payment.fiatAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-100 w-full my-4" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-guiso-orange">Monto en GUISO</span>
              <span className="text-lg font-bold text-guiso-orange">{payment.tokenAmount.toLocaleString()} GSO</span>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center p-4 bg-red-50 rounded-xl text-red-600 font-medium flex items-center justify-center gap-2">
              <Clock size={20} />
              Enlace Expirado
            </div>
          ) : isCompleted ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-green-50 rounded-xl border border-green-100"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-700 mb-1">Pago Completado</h3>
              <p className="text-sm text-green-600">Tu impacto ha sido registrado.</p>
              <Button onClick={() => navigate('/')} className="mt-4 w-full">Volver al Inicio</Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {!user.isWalletConnected ? (
                <Button 
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full py-4 text-lg"
                >
                  <Wallet className="mr-2" />
                  {isConnecting ? 'Cargando...' : 'Conectar para Pagar'}
                </Button>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Tu Balance:</span>
                    <span className={token.gsoBalance < payment.tokenAmount ? "text-red-500 font-bold" : "text-guiso-dark font-bold"}>
                      {token.gsoBalance.toLocaleString()} GSO
                    </span>
                  </div>
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || token.gsoBalance < payment.tokenAmount}
                    className="w-full py-4 text-lg relative overflow-hidden"
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="flex items-center justify-center gap-2 mb-1">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Procesando...
                        </span>
                      </div>
                    ) : (
                      'Pagar con GUISO'
                    )}
                  </Button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">o</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <Button 
                    onClick={() => setIsFiatModalOpen(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full py-4 text-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <CreditCard className="mr-2" />
                    Pagar con dinero local
                  </Button>

                  <div className="pt-4">
                    <Button 
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      variant="neutral"
                      className="w-full py-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border-dashed border-2 border-gray-300"
                    >
                      Simular Pago (Demo MVP)
                    </Button>
                    <p className="text-[10px] text-gray-400 text-center mt-2 italic">
                      Usa este botón para la presentación en vivo si no tienes una wallet conectada en el móvil.
                    </p>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-xs font-bold text-center mt-2 flex items-center justify-center gap-1">
                      <XCircle size={14} /> {errorMsg}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <TransactionStatusBadge status={mapStatusToTxStatus()} txHash={payment.txHash} />
          
          {!isCompleted && !isExpired && (
            <p className="text-center text-xs text-gray-400 mt-6">
              Expira en {Math.max(0, Math.floor((payment.expiresAt - Date.now()) / 60000))} minutos
            </p>
          )}
        </Card>
      </motion.div>

      {isFiatModalOpen && (
        <FiatPaymentModal 
          payment={payment} 
          onClose={() => setIsFiatModalOpen(false)} 
        />
      )}
    </div>
  );
}
