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
import { useTranslation } from '../../i18n';
import { useGuidedDemo } from '../demoGuided/useGuidedDemo';
import LoadingMessages from '../../components/LoadingMessages';
import { useDemoBalance } from '../demo/demoWallet';

import { useDemoEngine } from '../../demo/demoEngine';

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { loadPaymentIntent, updateStatus, attachTransaction, markCompleted } = usePaymentStore();
  const { token, recordSupportTransaction, user } = useGuisoCore();
  const { connect, isConnecting } = useWallet();
  const { t } = useTranslation();
  const { lockNavigation } = useGuidedDemo();
  const demoBalance = useDemoBalance();
  const demoEngine = useDemoEngine();
  
  const [payment, setPayment] = useState(paymentId ? loadPaymentIntent(paymentId) : null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);

  const isDemo = payment?.meta?.demo;

  useEffect(() => {
    if (isDemo) {
      if (demoEngine.state === 'completed') {
        setShowDemoToast(true);
        setTimeout(() => setShowDemoToast(false), 5000);
      }
    } else if (payment?.status === 'completed') {
      setShowDemoToast(true);
      setTimeout(() => setShowDemoToast(false), 5000);
    }
  }, [payment?.status, isDemo, demoEngine.state]);

  useEffect(() => {
    if (paymentId) {
      const p = loadPaymentIntent(paymentId);
      setPayment(p);
      
      const interval = setInterval(() => {
        const updated = loadPaymentIntent(paymentId);
        setPayment(updated);
        if (updated?.status === 'expired' || updated?.status === 'completed') {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [paymentId, loadPaymentIntent]);

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
            markCompleted(payment.id);
            recordSupportTransaction(payment.id, `Pago: ${payment.merchantName}`, payment.tokenAmount, payment.txHash, payment.meta);
          } else {
            updateStatus(payment.id, 'failed');
            setErrorMsg(t('errors.unconfirmedTransaction'));
            setTimeout(() => {
              if (isMounted) updateStatus(payment.id, 'awaiting_payment');
            }, 3000);
          }
        } catch (err: any) {
          if (!isMounted) return;
          updateStatus(payment.id, 'failed');
          setErrorMsg(err.message || t('errors.unexpectedError'));
          setTimeout(() => {
            if (isMounted) updateStatus(payment.id, 'awaiting_payment');
          }, 3000);
        }
      }
    };

    resumeTransaction();
    return () => { isMounted = false; };
  }, [payment?.status, payment?.txHash, payment?.id]);

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="glass" padding="lg" className="text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">{t('payments.notFound')}</h2>
          <p className="text-gray-500 mb-6">{t('payments.invalidLink')}</p>
          <Button onClick={() => {
            if (!lockNavigation) navigate('/');
          }}>{t('certificates.backToHome')}</Button>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    if (payment.meta?.demo) {
      if (demoEngine.state === 'idle') {
        demoEngine.createPayment();
      }
      // Need a small timeout to allow state to update if we just called createPayment,
      // but demoEngine is synchronous so we can just call it immediately.
      demoEngine.simulateClient();
      return;
    }

    if (!user.isWalletConnected) return;
    
    const currentBalance = token.gsoBalance;
    
    if (currentBalance < payment.tokenAmount) {
      setErrorMsg(t('errors.insufficientBalance'));
      return;
    }
    if (payment.status === 'completed' || payment.status === 'confirming' || payment.status === 'pending') {
      return;
    }

    setErrorMsg(null);
    updateStatus(payment.id, 'pending');
    
    try {
      const transactionAdapter = web3Bridge.getTransaction();
      const result = await transactionAdapter.sendTransaction(payment.tokenAmount, `Payment to ${payment.merchantName}`);
      
      if (!result.success) {
        updateStatus(payment.id, 'failed');
        setErrorMsg(result.error || t('errors.transactionFailed'));
        setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
        return;
      }
      
      attachTransaction(payment.id, result.txHash);
      
      const confirmed = await transactionAdapter.waitForTransaction(result.txHash);
      
      if (confirmed) {
        markCompleted(payment.id);
        recordSupportTransaction(payment.id, `Pago: ${payment.merchantName}`, payment.tokenAmount, result.txHash, payment.meta);
      } else {
        updateStatus(payment.id, 'failed');
        setErrorMsg(t('errors.unconfirmedTransaction'));
        setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
      }
    } catch (err: any) {
      updateStatus(payment.id, 'failed');
      setErrorMsg(err.message || t('errors.unexpectedError'));
      setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
    }
  };

  const isExpired = payment.status === 'expired';
  const isCompleted = isDemo ? demoEngine.state === 'completed' || demoEngine.state === 'certificate_generated' : payment.status === 'completed';
  const isProcessing = isDemo ? demoEngine.state === 'processing' : payment.status === 'pending' || payment.status === 'confirming';

  const currentBalance = isDemo ? demoBalance : token.gsoBalance;

  const mapStatusToTxStatus = (): TransactionStatus => {
    if (isDemo) {
      if (demoEngine.state === 'processing') return 'confirming';
      if (demoEngine.state === 'completed' || demoEngine.state === 'certificate_generated') return 'confirmed';
      return 'idle';
    }
    switch (payment.status) {
      case 'pending': return 'pending';
      case 'confirming': return 'confirming';
      case 'completed': return 'confirmed';
      case 'failed': return 'failed';
      default: return 'idle';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-md ${isCompleted && isDemo ? 'shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-2xl transition-shadow duration-1000' : ''}`}
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
              <span className="text-gray-500 font-medium">{t('payments.totalToPay')}</span>
              <span className="text-2xl font-bold text-guiso-dark">${payment.fiatAmount.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-100 w-full my-4" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-guiso-orange">{t('payments.amountInGuiso')}</span>
              <span className="text-lg font-bold text-guiso-orange">{payment.tokenAmount.toLocaleString()} GSO</span>
            </div>
          </div>

          {isExpired ? (
            <div className="text-center p-4 bg-red-50 rounded-xl text-red-600 font-medium flex items-center justify-center gap-2">
              <Clock size={20} />
              {t('payments.expired')}
            </div>
          ) : isCompleted ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-green-50 rounded-xl border border-green-100"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-700 mb-1">{t('payments.completed')}</h3>
              <p className="text-sm text-green-600">{t('payments.impactRegistered')}</p>
              <Button onClick={() => {
                if (!lockNavigation) navigate('/');
              }} className="mt-4 w-full">{t('certificates.backToHome')}</Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {(!user.isWalletConnected && !payment.meta?.demo) ? (
                <Button 
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full py-4 text-lg"
                >
                  <Wallet className="mr-2" />
                  {isConnecting ? t('common.loading') : t('payments.connectToPay')}
                </Button>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">{t('payments.yourBalance')}:</span>
                    <span className={currentBalance < payment.tokenAmount ? "text-red-500 font-bold" : "text-guiso-dark font-bold"}>
                      {currentBalance.toLocaleString()} GSO
                    </span>
                  </div>
                  <Button 
                    onClick={handlePayment}
                    disabled={isProcessing || currentBalance < payment.tokenAmount}
                    className="w-full py-4 text-lg relative overflow-hidden"
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center w-full">
                        <span className="flex items-center justify-center gap-2 mb-1">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t('payments.processing')}
                        </span>
                        <div className="text-white/80 w-full">
                          <LoadingMessages />
                        </div>
                      </div>
                    ) : (
                      t('payments.payWithGuiso')
                    )}
                  </Button>
                  
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">{t('common.or')}</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <Button 
                    onClick={() => setIsFiatModalOpen(true)}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full py-4 text-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <CreditCard className="mr-2" />
                    {t('payments.payWithFiat')}
                  </Button>

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
              {t('payments.expiresIn')} {Math.max(0, Math.floor((payment.expiresAt - Date.now()) / 60000))} {t('common.minutes')}
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

      {showDemoToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
        >
          <CheckCircle2 size={20} />
          Impacto real simulado generado ✔
        </motion.div>
      )}
    </div>
  );
}
