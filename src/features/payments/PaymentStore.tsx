import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PaymentIntent, PaymentStatus } from './types';

interface PaymentContextType {
  payments: Record<string, PaymentIntent>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Record<string, PaymentIntent>>({});

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/payments');
        if (res.ok) {
          const data = await res.json();
          const paymentsMap = data.reduce((acc: Record<string, PaymentIntent>, p: PaymentIntent) => {
            acc[p.id] = p;
            return acc;
          }, {});
          setPayments(paymentsMap);
        } else {
          console.error(`Error fetching payments: ${res.status} ${res.statusText}`);
          const text = await res.text();
          console.error('Response body:', text);
        }
      } catch (error) {
        console.error('Network error fetching payments:', error);
      }
    };

    fetchPayments();
    
    const interval = setInterval(fetchPayments, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PaymentContext.Provider value={{
      payments
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
