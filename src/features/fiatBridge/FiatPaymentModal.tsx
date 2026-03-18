import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, RefreshCw, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui';
import { useFiatPaymentProcessor } from './FiatPaymentProcessor';
import { PaymentIntent } from '../payments/types';
interface FiatPaymentModalProps {
  payment: PaymentIntent;
  onClose: () => void;
}

export default function FiatPaymentModal({ payment, onClose }: FiatPaymentModalProps) {
  const { processPayment, currentStatus, error } = useFiatPaymentProcessor();

  const handlePay = () => {
    processPayment(payment.id, payment.fiatAmount);
  };

  const renderContent = () => {
    if (currentStatus === 'created') {
      return (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">{payment.merchantName}</h3>
            <p className="text-gray-500">{payment.description}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
            <p className="text-4xl font-display font-bold text-gray-900">
              ${payment.fiatAmount.toFixed(2)} <span className="text-lg text-gray-500">ARS</span>
            </p>
          </div>

          <Button onClick={handlePay} className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white border-0">
            <CreditCard className="mr-2" />
            Pagar con dinero local
          </Button>
        </div>
      );
    }

    if (currentStatus === 'processing' || currentStatus === 'converting' || currentStatus === 'sending_tokens') {
      return (
        <div className="py-12 text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
              {currentStatus === 'processing' && <CreditCard size={24} />}
              {currentStatus === 'converting' && <RefreshCw size={24} className="animate-spin" />}
              {currentStatus === 'sending_tokens' && <Send size={24} className="animate-pulse" />}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">
              {currentStatus === 'processing' && 'Procesando pago...'}
              {currentStatus === 'converting' && 'Convirtiendo a GUISO...'}
              {currentStatus === 'sending_tokens' && 'Confirmando en blockchain...'}
            </h3>
            <p className="text-sm text-gray-500">Por favor no cierres esta ventana</p>
          </div>
        </div>
      );
    }

    if (currentStatus === 'completed') {
      return (
        <div className="py-12 text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={40} />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h3>
            <p className="text-gray-500">Tu impacto ha sido verificado en la blockchain.</p>
          </div>
          <Button onClick={onClose} variant="outline" className="w-full">
            Cerrar
          </Button>
        </div>
      );
    }

    if (currentStatus === 'failed') {
      return (
        <div className="py-12 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error en el pago</h3>
            <p className="text-red-500 text-sm">{error || 'Ocurrió un error inesperado'}</p>
          </div>
          <Button onClick={onClose} variant="outline" className="w-full">
            Volver
          </Button>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          {currentStatus === 'created' && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
          
          <div className="p-8">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
