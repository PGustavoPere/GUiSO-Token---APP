import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, CheckCircle2, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../../components/ui';
import { usePaymentStore } from '../payments/PaymentStore';
import { useMerchantStore } from './MerchantStore';
import { generatePaymentQRUrl } from '../payments/paymentQR';
import { convertFiatToGuiso, TOKEN_SYMBOL } from '../../core/economy';

interface CreatePaymentModalProps {
  onClose: () => void;
}

export default function CreatePaymentModal({ onClose }: CreatePaymentModalProps) {
  const { merchant } = useMerchantStore();
  
  const [description, setDescription] = useState('');
  const [amountARS, setAmountARS] = useState<number | ''>('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  const tokenAmount = amountARS ? convertFiatToGuiso(Number(amountARS)) : 0;

  const handleCreate = async () => {
    if (!merchant || !amountARS || !description) return;
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName: merchant.name,
          description,
          fiatAmount: Number(amountARS),
          tokenAmount,
          walletAddress: merchant.walletAddress,
        })
      });
      
      const data = await response.json();
      if (data.id) {
        setPaymentId(data.id);
        setPaymentStatus('awaiting_payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  useEffect(() => {
    if (!paymentId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/${paymentId}`);
        if (response.ok) {
          const payment = await response.json();
          setPaymentStatus(payment.status);
          if (payment.status === 'completed' || payment.status === 'expired') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error fetching payment status:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentId]);

  const paymentUrl = paymentId ? generatePaymentQRUrl(paymentId) : '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] md:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-display font-bold">Crear Cobro</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!paymentId ? (
              <motion.div key="form" exit={{ opacity: 0, y: -20 }}>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Descripción</label>
                    <input 
                      type="text" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ej. Café y Medialunas"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Monto en ARS</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input 
                        type="number" 
                        value={amountARS}
                        onChange={(e) => setAmountARS(e.target.value ? Number(e.target.value) : '')}
                        placeholder="0.00"
                        className="w-full pl-8 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-display font-bold focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                      />
                    </div>
                  </div>

                  <div className="bg-guiso-orange/5 p-4 rounded-xl border border-guiso-orange/10 flex justify-between items-center">
                    <span className="text-sm font-bold text-guiso-orange">Total a cobrar en GUISO:</span>
                    <span className="text-lg font-bold text-guiso-orange">{tokenAmount} GSO</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCreate}
                  disabled={!amountARS || !description || tokenAmount <= 0}
                  className="w-full py-4 text-lg"
                >
                  Generar QR de Cobro
                </Button>
              </motion.div>
            ) : paymentStatus === 'completed' ? (
              <motion.div 
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-guiso-dark mb-2">¡Cobro Exitoso!</h3>
                  <p className="text-gray-500">Has recibido {tokenAmount} GSO.</p>
                </div>
                <Button onClick={onClose} className="w-full">Cerrar</Button>
              </motion.div>
            ) : (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
              >
                <div className="bg-gray-50 p-6 rounded-2xl inline-block border border-gray-100">
                  <QRCodeSVG value={paymentUrl} size={200} />
                </div>
                
                <div>
                  <p className="text-2xl font-display font-bold text-guiso-dark">{tokenAmount} GSO</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-guiso-orange font-bold animate-pulse">
                  <div className="w-2 h-2 bg-guiso-orange rounded-full" />
                  Esperando pago...
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => navigator.clipboard.writeText(paymentUrl)}
                  >
                    <Copy size={14} className="mr-2" /> Copiar Link
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
