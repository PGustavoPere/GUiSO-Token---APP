import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface GuidedDemoState {
  active: boolean;
  step: number;
  completed: boolean;
  lockNavigation: boolean;
}

interface GuidedDemoContextType extends GuidedDemoState {
  startGuidedDemo: () => void;
  nextStep: () => void;
  previousStep: () => void;
  finishDemo: () => void;
  closeOverlay: () => void;
  resetGuidedDemo: () => void;
}

const GuidedDemoContext = createContext<GuidedDemoContextType | null>(null);

const STORAGE_KEY = 'GSO_GUIDED_DEMO';

export const GuidedDemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GuidedDemoState>(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return { active: false, step: 1, completed: false, lockNavigation: false };
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startGuidedDemo = useCallback(() => {
    setState({ active: true, step: 1, completed: false, lockNavigation: true });
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  }, []);

  const finishDemo = useCallback(() => {
    setState(prev => ({ ...prev, active: false, completed: true, lockNavigation: false }));
  }, []);

  const closeOverlay = useCallback(() => {
    setState(prev => ({ ...prev, active: false, lockNavigation: false }));
  }, []);

  const resetGuidedDemo = useCallback(() => {
    setState({ active: false, step: 1, completed: false, lockNavigation: false });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <GuidedDemoContext.Provider value={{
      ...state,
      startGuidedDemo,
      nextStep,
      previousStep,
      finishDemo,
      closeOverlay,
      resetGuidedDemo
    }}>
      {children}
    </GuidedDemoContext.Provider>
  );
};

export const useGuidedDemoStore = () => {
  const context = useContext(GuidedDemoContext);
  if (!context) {
    throw new Error('useGuidedDemoStore must be used within a GuidedDemoProvider');
  }
  return context;
};
