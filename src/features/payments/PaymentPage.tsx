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

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { loadPaymentIntent, updateStatus, attachTransaction, markCompleted } = usePaymentStore();
  const { token, recordSupportTransaction, user } = useGuisoCore();
  const { connect, isConnecting } = useWallet();
  
  const [payment, setPayment] = useState(paymentId ? loadPaymentIntent(paymentId) : null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFiatModalOpen, setIsFiatModalOpen] = useState(false);

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

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card variant="glass" padding="lg" className="text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Pago no encontrado</h2>
          <p className="text-gray-500 mb-6">El enlace de pago es inválido o no existe.</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </Card>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!user.isWalletConnected) return;
    if (token.gsoBalance < payment.tokenAmount) {
      setErrorMsg('Balance insuficiente de GUISO Tokens');
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
        setErrorMsg(result.error || 'Transacción fallida');
        setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
        return;
      }
      
      attachTransaction(payment.id, result.txHash);
      
      const confirmed = await transactionAdapter.waitForTransaction(result.txHash);
      
      if (confirmed) {
        markCompleted(payment.id);
        recordSupportTransaction(payment.id, `Pago: ${payment.merchantName}`, payment.tokenAmount, result.txHash);
      } else {
        updateStatus(payment.id, 'failed');
        setErrorMsg('La transacción no pudo ser confirmada');
        setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
      }
    } catch (err: any) {
      updateStatus(payment.id, 'failed');
      setErrorMsg(err.message || 'Error inesperado');
      setTimeout(() => updateStatus(payment.id, 'awaiting_payment'), 3000);
    }
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
              El pago ha expirado
            </div>
          ) : isCompleted ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 bg-green-50 rounded-xl border border-green-100"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-700 mb-1">¡Pago Completado!</h3>
              <p className="text-sm text-green-600">Tu impacto ha sido registrado.</p>
              <Button onClick={() => navigate('/')} className="mt-4 w-full">Volver al inicio</Button>
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
                  {isConnecting ? 'Conectando...' : 'Conectar Wallet para Pagar'}
                </Button>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Tu balance:</span>
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
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Procesando Pago...
                      </span>
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
                    Pagar con dinero local (ARS)
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
