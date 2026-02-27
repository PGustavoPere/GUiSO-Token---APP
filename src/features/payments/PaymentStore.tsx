import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PaymentIntent, PaymentStatus } from './types';

interface PaymentContextType {
  payments: Record<string, PaymentIntent>;
  createPaymentIntent: (intent: Omit<PaymentIntent, 'id' | 'status' | 'createdAt' | 'expiresAt'>) => string;
  loadPaymentIntent: (id: string) => PaymentIntent | null;
  updateStatus: (id: string, status: PaymentStatus) => void;
  attachTransaction: (id: string, txHash: string) => void;
  markCompleted: (id: string) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Record<string, PaymentIntent>>(() => {
    const saved = localStorage.getItem('guiso_payments');
    if (saved) {
      return JSON.parse(saved);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('guiso_payments', JSON.stringify(payments));
  }, [payments]);

  const createPaymentIntent = useCallback((intent: Omit<PaymentIntent, 'id' | 'status' | 'createdAt' | 'expiresAt'>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const now = Date.now();
    const newPayment: PaymentIntent = {
      ...intent,
      id,
      status: 'awaiting_payment',
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000, // 15 minutes
    };
    setPayments(prev => ({ ...prev, [id]: newPayment }));
    return id;
  }, []);

  const loadPaymentIntent = useCallback((id: string) => {
    const payment = payments[id];
    if (!payment) return null;

    if (payment.status !== 'completed' && payment.status !== 'failed' && Date.now() > payment.expiresAt) {
      const expiredPayment = { ...payment, status: 'expired' as PaymentStatus };
      setPayments(prev => ({ ...prev, [id]: expiredPayment }));
      return expiredPayment;
    }
    return payment;
  }, [payments]);

  const updateStatus = useCallback((id: string, status: PaymentStatus) => {
    setPayments(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], status } };
    });
  }, []);

  const attachTransaction = useCallback((id: string, txHash: string) => {
    setPayments(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], txHash, status: 'confirming' } };
    });
  }, []);

  const markCompleted = useCallback((id: string) => {
    setPayments(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], status: 'completed' } };
    });
  }, []);

  return (
    <PaymentContext.Provider value={{
      payments,
      createPaymentIntent,
      loadPaymentIntent,
      updateStatus,
      attachTransaction,
      markCompleted
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentStore = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePaymentStore must be used within a PaymentProvider');
  return context;
};
