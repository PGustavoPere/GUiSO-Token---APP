import { useState, useEffect } from 'react';
import { impactCertificateService } from '../features/impactCertificate/impactCertificateService';
import { spendDemoBalance, resetDemoBalance } from '../features/demo/demoWallet';

export type DemoState =
  | "idle"
  | "payment_created"
  | "processing"
  | "certificate_generating"
  | "completed";

export interface DemoContext {
  state: DemoState;
  certificates: number;
}

type Listener = (context: DemoContext) => void;

class DemoEngine {
  private context: DemoContext = {
    state: "idle",
    certificates: 0,
  };
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.context);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.context));
  }

  setDemoState(newState: DemoState) {
    this.context.state = newState;
    this.notify();
  }

  createPayment() {
    if (this.context.state === "idle" || this.context.state === "completed") {
      this.setDemoState("payment_created");
    }
  }

  simulateClient() {
    if (this.context.state === "payment_created") {
      this.setDemoState("processing");
      spendDemoBalance(15000);
    }
  }

  generateDemoCertificate() {
    this.context.certificates += 1;
    
    impactCertificateService.generateCertificate(
      `0xDEMO_TX_${Date.now()}`,
      `0xDEMO_WALLET_${Math.random().toString(16).slice(2, 8)}`,
      'Comedor Esperanza (Demo)',
      15000,
      { demo: true }
    );
    
    window.dispatchEvent(new CustomEvent('demo_certificate_generated', {
      detail: { impactAmount: 15000 }
    }));
    
    this.notify();
  }

  resetDemo() {
    this.context = {
      state: "idle",
      certificates: 0,
    };
    resetDemoBalance();
    this.notify();
  }
  
  getState() {
    return this.context;
  }
}

export const demoEngine = new DemoEngine();

export function useDemoEngine() {
  const [state, setState] = useState(demoEngine.getState());

  useEffect(() => {
    return demoEngine.subscribe(setState);
  }, []);

  return {
    ...state,
    createPayment: () => demoEngine.createPayment(),
    simulateClient: () => demoEngine.simulateClient(),
    setDemoState: (newState: DemoState) => demoEngine.setDemoState(newState),
    generateDemoCertificate: () => demoEngine.generateDemoCertificate(),
    resetDemo: () => demoEngine.resetDemo(),
  };
}
