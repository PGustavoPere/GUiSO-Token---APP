import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PaymentIntent, PaymentStatus } from './types';

interface PaymentContextType {
  payments: Record<string, PaymentIntent>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Record<string, PaymentIntent>>({});

  useEffect(() => {
    let errorCount = 0;
    const fetchPayments = async () => {
      try {
        const url = `${window.location.origin}/api/payments`;
        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        const contentType = res.headers.get('content-type');
        
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          const paymentsMap = data.reduce((acc: Record<string, PaymentIntent>, p: PaymentIntent) => {
            acc[p.id] = p;
            return acc;
          }, {});
          setPayments(paymentsMap);
          errorCount = 0; // Reset on success
        } else if (!res.ok) {
          if (errorCount < 3) {
            console.error(`Error fetching payments from ${url}: ${res.status} ${res.statusText}`);
            errorCount++;
          }
        } else {
          // res.ok but not JSON (likely HTML fallback)
          if (errorCount < 3) {
            console.warn(`Received non-JSON response from ${url}`);
            errorCount++;
          }
        }
      } catch (error: any) {
        if (errorCount < 3) {
          console.error(`Network error fetching payments from /api/payments:`, error.message || error);
          errorCount++;
        }
      }
    };

    // Initial delay to ensure server is ready
    const timeout = setTimeout(fetchPayments, 1000);
    
    const interval = setInterval(fetchPayments, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
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
