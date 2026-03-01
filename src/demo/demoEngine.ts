import { useState, useEffect } from 'react';
import { impactCertificateService } from '../features/impactCertificate/impactCertificateService';
import { spendDemoBalance, resetDemoBalance } from '../features/demo/demoWallet';

export type DemoState =
  | "idle"
  | "payment_created"
  | "client_simulated"
  | "processing"
  | "certificate_generated"
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
  private processingTimeout: NodeJS.Timeout | null = null;
  private certificateTimeout: NodeJS.Timeout | null = null;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.context);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.context));
  }

  private setState(newState: DemoState) {
    this.context.state = newState;
    this.notify();
  }

  createPayment() {
    if (this.context.state === "idle" || this.context.state === "completed") {
      this.setState("payment_created");
    }
  }

  simulateClient() {
    if (this.context.state === "payment_created") {
      this.setState("client_simulated");
      
      setTimeout(() => {
        this.setState("processing");
        spendDemoBalance(15000);
        
        this.processingTimeout = setTimeout(() => {
          if (this.context.state !== "processing") return;
          this.setState("certificate_generated");
          this.context.certificates += 1;
          
          impactCertificateService.generateCertificate(
            `0xDEMO_TX_${Date.now()}`,
            `0xDEMO_WALLET_${Math.random().toString(16).slice(2, 8)}`,
            'Comedor Esperanza (Demo)',
            15000,
            { demo: true }
          );
          
          this.notify();
          
          window.dispatchEvent(new CustomEvent('demo_certificate_generated', {
            detail: { impactAmount: 15000 }
          }));
          
          this.certificateTimeout = setTimeout(() => {
            this.setState("completed");
          }, 500);
        }, 2000);
      }, 500);
    }
  }

  resetDemo() {
    if (this.processingTimeout) clearTimeout(this.processingTimeout);
    if (this.certificateTimeout) clearTimeout(this.certificateTimeout);
    
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
    resetDemo: () => demoEngine.resetDemo(),
  };
}
