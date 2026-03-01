import { useState, useEffect } from 'react';

export const DEMO_INITIAL_BALANCE = 100000;

let demoBalance = DEMO_INITIAL_BALANCE;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

export function getDemoBalance() {
  return demoBalance;
}

export function spendDemoBalance(amount: number) {
  demoBalance -= amount;
  notify();
}

export function resetDemoBalance() {
  demoBalance = DEMO_INITIAL_BALANCE;
  notify();
}

export function useDemoBalance() {
  const [balance, setBalance] = useState(demoBalance);
  
  useEffect(() => {
    const listener = () => setBalance(demoBalance);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  return balance;
}
