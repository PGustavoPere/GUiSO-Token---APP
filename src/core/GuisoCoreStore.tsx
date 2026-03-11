/**
 * GuisoCoreStore - El "Cerebro" de GUISO.
 * Este módulo gestiona la verdad única sobre el impacto del usuario.
 * Aquí es donde los tokens GSO se transforman en Puntos de Impacto (IP)
 * y se registra cada acción social para garantizar la transparencia.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { impactEngine, LevelThreshold } from '../system/impactEngine';
import { useWallet } from './WalletProvider';

import { web3Bridge } from '../web3/web3Provider';
import { tokenBalanceService } from '../web3/tokenBalanceService';

/**
 * Tipos de datos para el Core Store
 */
export interface Transaction {
  id: string;
  type: 'support' | 'receive' | 'vote';
  amount: number;
  target: string;
  date: string;
  impactPoints: number;
  txHash?: string;
}

export interface UserState {
  username: string;
  impactScore: number;
  communityLevel: string;
  isWalletConnected: boolean;
  walletAddress: string | null;
  hasExperiencedImpactMoment: boolean;
  isDemoModeActive: boolean;
  demoStep: number;
  hasSeenWelcome: boolean;
}

export interface TokenState {
  gsoBalance: number;
  transactions: Transaction[];
  impactPower: number;
  influenceBadge: string;
}

export interface GlobalImpactState {
  totalImpact: number;
  supportedCauses: number;
  communityMembers: number;
}

interface GuisoCoreContextType {
  // State slices
  user: UserState;
  token: TokenState;
  global: GlobalImpactState;
  
  // UI State
  levelUpNotification: LevelThreshold | null;
  activeImpactMoment: { points: number; target: string } | null;

  // Actions
  recordSupportTransaction: (projectId: string, projectTitle: string, amount: number, txHash: string) => void;
  earnImpact: (points: number) => void;
  updateGlobalImpact: (impact: number, meals?: number) => void;
  dismissNotification: () => void;
  dismissImpactMoment: () => void;
  
  // Demo Actions
  startDemo: () => void;
  skipDemo: () => void;
  nextDemoStep: () => void;
  resetDemo: () => void;
}

const GuisoCoreContext = createContext<GuisoCoreContextType | undefined>(undefined);

/**
 * Valores iniciales por defecto
 */
const INITIAL_USER: UserState = {
  username: "Explorador Guiso",
  impactScore: 0,
  communityLevel: impactEngine.calculateLevel(0).level,
  isWalletConnected: false,
  walletAddress: null,
  hasExperiencedImpactMoment: false,
  isDemoModeActive: false,
  demoStep: 0,
  hasSeenWelcome: false,
};

const INITIAL_TOKEN: TokenState = {
  gsoBalance: 10000,
  transactions: [],
  impactPower: 15000,
  influenceBadge: 'Pilar de la Comunidad',
};

const INITIAL_GLOBAL: GlobalImpactState = {
  totalImpact: 125400,
  supportedCauses: 42,
  communityMembers: 856,
};

export const GuisoCoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const [user, setUser] = useState<UserState>(INITIAL_USER);
  const [token, setToken] = useState<TokenState>(INITIAL_TOKEN);
  const [global, setGlobal] = useState<GlobalImpactState>(INITIAL_GLOBAL_STATS_ADAPTED);
  const [levelUpNotification, setLevelUpNotification] = useState<LevelThreshold | null>(null);
  const [activeImpactMoment, setActiveImpactMoment] = useState<{ points: number; target: string } | null>(null);
  const isLoaded = useRef(false);

  // Sync with WalletProvider
  useEffect(() => {
    setUser(prev => ({
      ...prev,
      isWalletConnected: isConnected,
      walletAddress: address
    }));

    if (isConnected && address && web3Bridge.getMode() === 'web3') {
      tokenBalanceService.getBalance(address).then(result => {
        setToken(prev => ({
          ...prev,
          gsoBalance: result.balance,
          impactPower: tokenBalanceService.getImpactPower(result.balance),
          influenceBadge: tokenBalanceService.getInfluenceBadge(result.balance),
        }));
      });
    }
  }, [isConnected, address]);

  // Persistencia: Cargar estado inicial
  useEffect(() => {
    const savedStore = localStorage.getItem('guiso_core_store');
    
    if (savedStore) {
      const parsed = JSON.parse(savedStore);
      // Merge with INITIAL_USER to ensure new properties exist
      setUser(prev => {
        const userState = { 
          ...INITIAL_USER, 
          ...parsed.user, 
          hasSeenWelcome: true 
        };
        // Migration: Recalculate community level
        userState.communityLevel = impactEngine.calculateLevel(userState.impactScore).level;
        return userState;
      });
      setToken(parsed.token);
      setGlobal(parsed.global);
    }
    isLoaded.current = true;
  }, []);

  // Persistencia: Guardar cambios
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('guiso_core_store', JSON.stringify({ user, token, global }));
    }
  }, [user, token, global]);

  /**
   * Acción: Registrar una transacción de apoyo confirmada
   */
  const recordSupportTransaction = useCallback((projectId: string, projectTitle: string, amount: number, txHash: string) => {
    if (amount > token.gsoBalance) return;

    const impactGenerated = impactEngine.calculateImpactPoints(amount);
    
    // 1. Actualizar Token State (Balance y Transacciones)
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'support',
      amount,
      target: projectTitle,
      date: new Date().toISOString().split('T')[0],
      impactPoints: impactGenerated,
      txHash: txHash
    };

    setToken(prev => {
      const newBalance = prev.gsoBalance - amount;
      return {
        gsoBalance: newBalance,
        transactions: [newTransaction, ...prev.transactions],
        impactPower: tokenBalanceService.getImpactPower(newBalance),
        influenceBadge: tokenBalanceService.getInfluenceBadge(newBalance),
      };
    });

    // 2. Actualizar User State (Impact Score y Nivel)
    const newImpactScore = user.impactScore + impactGenerated;
    const currentLevel = impactEngine.calculateLevel(user.impactScore);
    const nextLevel = impactEngine.calculateLevel(newImpactScore);

    if (currentLevel.level !== nextLevel.level) {
      setLevelUpNotification(nextLevel);
    }

    // Trigger Impact Moment if first time
    if (!user.hasExperiencedImpactMoment) {
      setActiveImpactMoment({ points: impactGenerated, target: projectTitle });
    }

    setUser(prev => ({
      ...prev,
      impactScore: newImpactScore,
      communityLevel: nextLevel.level,
      hasExperiencedImpactMoment: true,
    }));

    // 3. Actualizar Global Impact
    setGlobal(prev => ({
      ...prev,
      totalImpact: prev.totalImpact + impactGenerated,
    }));
  }, [token.gsoBalance, user.impactScore, user.hasExperiencedImpactMoment]);

  /**
   * Acción: Ganar impacto (por otras acciones como votar)
   */
  const earnImpact = useCallback((points: number) => {
    setUser(prev => ({
      ...prev,
      impactScore: prev.impactScore + points,
      communityLevel: impactEngine.calculateLevel(prev.impactScore + points).level,
    }));
  }, []);

  /**
   * Acción: Actualizar impacto global
   */
  const updateGlobalImpact = useCallback((impact: number) => {
    setGlobal(prev => ({
      ...prev,
      totalImpact: prev.totalImpact + impact,
    }));
  }, []);

  const dismissNotification = useCallback(() => {
    setLevelUpNotification(null);
  }, []);

  const dismissImpactMoment = useCallback(() => {
    setActiveImpactMoment(null);
  }, []);

  const startDemo = useCallback(() => {
    // No-op
  }, []);

  const skipDemo = useCallback(() => {
    // No-op
  }, []);

  const nextDemoStep = useCallback(() => {
    // No-op
  }, []);

  const resetDemo = useCallback(() => {
    // No-op
  }, []);

  return (
    <GuisoCoreContext.Provider value={{
      user,
      token,
      global,
      levelUpNotification,
      activeImpactMoment,
      recordSupportTransaction,
      earnImpact,
      updateGlobalImpact,
      dismissNotification,
      dismissImpactMoment,
      startDemo,
      skipDemo,
      nextDemoStep,
      resetDemo
    }}>
      {children}
    </GuisoCoreContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al store
 */
export const useGuisoCore = () => {
  const context = useContext(GuisoCoreContext);
  if (!context) throw new Error('useGuisoCore must be used within a GuisoCoreProvider');
  return context;
};

// Adaptador para mantener compatibilidad con valores previos si existen
const INITIAL_GLOBAL_STATS_ADAPTED = {
  totalImpact: 125400,
  supportedCauses: 42,
  communityMembers: 856,
};
