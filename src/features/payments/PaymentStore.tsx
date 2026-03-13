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
        const contentType = res.headers.get('content-type');
        
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const paymentsMap = data.reduce((acc: Record<string, PaymentIntent>, p: PaymentIntent) => {
            acc[p.id] = p;
            return acc;
          }, {});
          setPayments(paymentsMap);
        } else if (!res.ok) {
          console.error(`Error fetching payments: ${res.status} ${res.statusText}`);
        } else {
          // res.ok but not JSON (likely HTML fallback)
          console.warn('Received non-JSON response from /api/payments');
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
