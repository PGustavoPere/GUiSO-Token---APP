import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FiatPayment, FiatPaymentStatus } from './fiatTypes';
import { fiatConversionService, FIAT_CONVERSION_RATE } from './fiatConversionService';

interface FiatBridgeContextType {
  payments: Record<string, FiatPayment>;
  createFiatPayment: (paymentIntentId: string, arsAmount: number) => string;
  updateStatus: (id: string, status: FiatPaymentStatus) => void;
  markCompleted: (id: string) => void;
  getPayments: () => FiatPayment[];
  getPaymentByIntentId: (intentId: string) => FiatPayment | undefined;
}

const FiatBridgeContext = createContext<FiatBridgeContextType | undefined>(undefined);

export const FiatBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Record<string, FiatPayment>>({});

  useEffect(() => {
    const saved = localStorage.getItem('guiso_fiat_payments');
    if (saved) {
      setPayments(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('guiso_fiat_payments', JSON.stringify(payments));
  }, [payments]);

  const createFiatPayment = useCallback((paymentIntentId: string, arsAmount: number) => {
    const id = `FIAT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tokenAmount = fiatConversionService.convertFiatToGuiso(arsAmount);
    
    const newPayment: FiatPayment = {
      id,
      paymentIntentId,
      fiatAmount: arsAmount,
      currency: 'ARS',
      conversionRate: FIAT_CONVERSION_RATE,
      tokenAmount,
      status: 'created',
      createdAt: Date.now(),
    };
    
    setPayments(prev => ({ ...prev, [id]: newPayment }));
    return id;
  }, []);

  const updateStatus = useCallback((id: string, status: FiatPaymentStatus) => {
    setPayments(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], status } };
    });
  }, []);

  const markCompleted = useCallback((id: string) => {
    setPayments(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], status: 'completed', completedAt: Date.now() } };
    });
  }, []);

  const getPayments = useCallback(() => {
    return (Object.values(payments) as FiatPayment[]).sort((a, b) => b.createdAt - a.createdAt);
  }, [payments]);

  const getPaymentByIntentId = useCallback((intentId: string) => {
    return (Object.values(payments) as FiatPayment[]).find(p => p.paymentIntentId === intentId);
  }, [payments]);

  return (
    <FiatBridgeContext.Provider value={{
      payments,
      createFiatPayment,
      updateStatus,
      markCompleted,
      getPayments,
      getPaymentByIntentId
    }}>
      {children}
    </FiatBridgeContext.Provider>
  );
};

export const useFiatBridgeStore = () => {
  const context = useContext(FiatBridgeContext);
  if (!context) throw new Error('useFiatBridgeStore must be used within a FiatBridgeProvider');
  return context;
};
