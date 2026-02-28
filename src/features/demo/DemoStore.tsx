import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoSession } from './demoTypes';
import { useMerchantStore } from '../merchant/MerchantStore';
import { usePaymentStore } from '../payments/PaymentStore';
import { impactCertificateService } from '../impactCertificate/impactCertificateService';

interface DemoContextType {
  isDemoMode: boolean;
  session: DemoSession | null;
  startDemo: () => void;
  resetDemo: () => void;
  createDemoPayment: () => string | null;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<DemoSession | null>(() => {
    const saved = sessionStorage.getItem('guiso_demo_session');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  });

  const { registerMerchant } = useMerchantStore();
  const { createPaymentIntent } = usePaymentStore();
  const navigate = useNavigate();

  // Clear demo certificates on load
  useEffect(() => {
    impactCertificateService.clearDemoCertificates();
  }, []);

  useEffect(() => {
    if (session) {
      sessionStorage.setItem('guiso_demo_session', JSON.stringify(session));
    } else {
      sessionStorage.removeItem('guiso_demo_session');
    }
  }, [session]);

  const startDemo = useCallback(() => {
    // Clear old demo data first
    impactCertificateService.clearDemoCertificates();
    
    // Create a demo merchant
    const demoMerchantAddress = `0xDEMO${Math.random().toString(16).slice(2, 38)}`;
    registerMerchant('Comedor Esperanza (Demo)', 'Buenos Aires', 'Alimentación', demoMerchantAddress);

    const newSession: DemoSession = {
      id: `DEMO-${Date.now()}`,
      startedAt: Date.now(),
      demoMerchantId: demoMerchantAddress,
    };
    setSession(newSession);
  }, [registerMerchant]);

  const resetDemo = useCallback(() => {
    impactCertificateService.clearDemoCertificates();
    setSession(null);
    navigate('/');
  }, [navigate]);

  const createDemoPayment = useCallback(() => {
    if (!session || !session.demoMerchantId) return null;

    const paymentId = createPaymentIntent({
      merchantName: 'Comedor Esperanza (Demo)',
      description: 'Donación para 50 platos de comida',
      fiatAmount: 15000,
      tokenAmount: 15000,
      walletAddress: session.demoMerchantId,
      meta: { demo: true }
    });

    setSession(prev => prev ? { ...prev, demoPaymentId: paymentId } : null);
    return paymentId;
  }, [session, createPaymentIntent]);

  return (
    <DemoContext.Provider value={{
      isDemoMode: !!session,
      session,
      startDemo,
      resetDemo,
      createDemoPayment
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoStore = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemoStore must be used within a DemoProvider');
  return context;
};
