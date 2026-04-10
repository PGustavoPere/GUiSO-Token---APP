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

import { api } from '../services/api';
import { impactCertificateService } from '../features/impactCertificate/impactCertificateService';

/**
 * Tipos de datos para el Core Store
 */
export type ActivityType = 'support' | 'receive' | 'vote' | 'purchase' | 'donation' | 'level_up';

export interface Transaction {
  id: string;
  type: ActivityType;
  amount: number;
  target: string;
  category?: string;
  description?: string;
  date: string;
  impactPoints: number;
  txHash?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  dateEarned: string;
}

export interface Certificate {
  id: string;
  name: string;
  image: string;
  date: string;
  impactPoints: number;
  category: string;
}

export interface UserState {
  username: string;
  bio?: string;
  avatar?: string;
  impactScore: number;
  communityLevel: string;
  badges: Badge[];
  certificates: Certificate[];
  isWalletConnected: boolean;
  walletAddress: string | null;
  hasExperiencedImpactMoment: boolean;
  isDemoModeActive: boolean;
  demoStep: number;
  hasSeenWelcome: boolean;
  joinedAt: string;
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
  recordSupportTransaction: (projectId: string, projectTitle: string, amount: number, txHash: string, category?: string) => string | void;
  transferTokens: (to: string, amount: number, description?: string) => void;
  addActivity: (activity: Omit<Transaction, 'id' | 'date'>) => void;
  updateProfile: (data: Partial<Pick<UserState, 'username' | 'bio' | 'avatar'>>) => void;
  addBadge: (badge: Omit<Badge, 'dateEarned'>) => void;
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
  bio: "Cocinando un mundo más justo, un GSO a la vez. 🍲",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guiso",
  impactScore: 0,
  communityLevel: impactEngine.calculateLevel(0).level,
  badges: [],
  certificates: [],
  isWalletConnected: false,
  walletAddress: null,
  hasExperiencedImpactMoment: false,
  isDemoModeActive: false,
  demoStep: 0,
  hasSeenWelcome: false,
  joinedAt: new Date().toISOString(),
};

const INITIAL_TOKEN: TokenState = {
  gsoBalance: 10000,
  transactions: [],
  impactPower: 0,
  influenceBadge: 'Nuevo Miembro',
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
  const [global, setGlobal] = useState<GlobalImpactState>(INITIAL_GLOBAL);
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

  // Real-time updates for balance and transactions
  useEffect(() => {
    if (!isConnected || !address) return;

    const fetchLatestData = async () => {
      if (web3Bridge.getMode() === 'web3') {
        const result = await tokenBalanceService.getBalance(address);
        setToken(prev => ({
          ...prev,
          gsoBalance: result.balance,
          impactPower: tokenBalanceService.getImpactPower(result.balance),
          influenceBadge: tokenBalanceService.getInfluenceBadge(result.balance),
        }));
      }
    };

    const interval = setInterval(fetchLatestData, 5000);
    
    // Also fetch global stats periodically
    const fetchGlobalStats = async () => {
      try {
        const stats = await api.getStats();
        setGlobal(stats);
      } catch (err) {
        console.error("Error fetching global stats:", err);
      }
    };
    
    fetchGlobalStats();
    const statsInterval = setInterval(fetchGlobalStats, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(statsInterval);
    };
  }, [isConnected, address]);

  // Marcar como cargado (sin persistencia local)
  useEffect(() => {
    isLoaded.current = true;
  }, []);

  /**
   * Acción: Agregar una actividad genérica al registro
   */
  const addActivity = useCallback((activity: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };

    setToken(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));

    if (activity.impactPoints > 0) {
      const newImpactScore = user.impactScore + activity.impactPoints;
      const nextLevel = impactEngine.calculateLevel(newImpactScore);
      
      setUser(prev => ({
        ...prev,
        impactScore: newImpactScore,
        communityLevel: nextLevel.level,
      }));

      setGlobal(prev => ({
        ...prev,
        totalImpact: prev.totalImpact + activity.impactPoints,
      }));
    }
  }, [user.impactScore]);

  /**
   * Acción: Actualizar datos del perfil
   */
  const updateProfile = useCallback((data: Partial<Pick<UserState, 'username' | 'bio' | 'avatar'>>) => {
    setUser(prev => ({ ...prev, ...data }));
  }, []);

  /**
   * Acción: Registrar una transacción de apoyo confirmada
   */
  const recordSupportTransaction = useCallback((projectId: string, projectTitle: string, amount: number, txHash: string, category: string = 'General') => {
    if (amount > token.gsoBalance) return '';
    if (!address) return '';

    const impactGenerated = impactEngine.calculateImpactPoints(amount);
    
    // Mapping of project IDs to specific unique images
    const projectSpecificImages: Record<string, string> = {
      '1': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop', // Cabrera
      '2': 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop', // Tía Kusi
      '3': 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=400&auto=format&fit=crop', // Pancitas Felices
      '4': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400&auto=format&fit=crop', // Remar
    };

    // Mapping of category to fallback images
    const categoryImages: Record<string, string> = {
      'Alimentación': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop',
      'Educación': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
      'Salud': 'https://images.unsplash.com/photo-1505751172107-573967a4dd29?q=80&w=400&auto=format&fit=crop',
      'Medio Ambiente': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop',
      'Comunidad': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=400&auto=format&fit=crop',
      'Infancia': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop',
      'Infancia y Alimentación': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=400&auto=format&fit=crop',
      'Social y Salud': 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=400&auto=format&fit=crop',
      'General': 'https://images.unsplash.com/photo-1559027615-cd9d7a915490?q=80&w=400&auto=format&fit=crop'
    };

    const certImage = projectSpecificImages[projectId] || categoryImages[category] || categoryImages['General'];

    // 1. Actualizar Token State (Balance y Transacciones)
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'support',
      amount,
      target: projectTitle,
      category,
      description: `Apoyo al proyecto: ${projectTitle}`,
      date: new Date().toISOString(),
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

    // Trigger Impact Moment if first time (check impactScore was 0)
    const isFirstImpact = user.impactScore === 0 && !user.hasExperiencedImpactMoment;
    if (isFirstImpact) {
      setActiveImpactMoment({ points: impactGenerated, target: projectTitle });
    }

    // Generate the official certificate via the service
    const officialCert = impactCertificateService.generateCertificate(
      txHash,
      address,
      `Impacto en ${projectTitle}`,
      impactGenerated
    );

    const certId = officialCert.id;
    
    // Prevent duplicate certificates in user state
    setUser(prev => {
      if (prev.certificates.some(c => c.id === certId)) return prev;
      
      const newCertificate: Certificate = {
        id: certId,
        name: `Impacto en ${projectTitle}`,
        image: certImage,
        date: new Date().toISOString(),
        impactPoints: impactGenerated,
        category: category
      };

      return {
        ...prev,
        impactScore: newImpactScore,
        communityLevel: nextLevel.level,
        hasExperiencedImpactMoment: prev.hasExperiencedImpactMoment || isFirstImpact,
        certificates: [newCertificate, ...prev.certificates]
      };
    });

    // 3. Actualizar Global Impact
    setGlobal(prev => ({
      ...prev,
      totalImpact: prev.totalImpact + impactGenerated,
    }));

    return certId;
  }, [token.gsoBalance, user.impactScore, user.hasExperiencedImpactMoment, address]);

  /**
   * Acción: Transferir tokens a otra wallet
   */
  const transferTokens = useCallback((to: string, amount: number, description: string = 'Transferencia enviada') => {
    if (amount > token.gsoBalance) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'purchase', // Using purchase as a generic outgoing type for now, or we could add 'transfer'
      amount,
      target: to,
      description,
      date: new Date().toISOString(),
      impactPoints: 0, // Transfers don't usually generate impact points directly
    };

    setToken(prev => {
      const newBalance = prev.gsoBalance - amount;
      return {
        ...prev,
        gsoBalance: newBalance,
        transactions: [newTransaction, ...prev.transactions],
        impactPower: tokenBalanceService.getImpactPower(newBalance),
        influenceBadge: tokenBalanceService.getInfluenceBadge(newBalance),
      };
    });
  }, [token.gsoBalance]);

  /**
   * Acción: Ganar impacto (por otras acciones como votar)
   */
  const addBadge = useCallback((badge: Omit<Badge, 'dateEarned'>) => {
    setUser(prev => {
      if (prev.badges.some(b => b.id === badge.id)) return prev;
      return {
        ...prev,
        badges: [...prev.badges, { ...badge, dateEarned: new Date().toISOString() }]
      };
    });
  }, []);

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

  // Badges Unlocking Logic
  useEffect(() => {
    if (!isLoaded.current) return;

    const currentBadges = user.badges.map(b => b.id);
    
    // 1. Primer Aporte
    if (token.transactions.length > 0 && !currentBadges.includes('first_contribution')) {
      addBadge({
        id: 'first_contribution',
        name: 'Primer Aporte',
        icon: '🌱',
        description: 'Tu primer paso para cambiar el mundo.'
      });
    }

    // 2. Donante Constante
    const supportCount = token.transactions.filter(t => t.type === 'support').length;
    if (supportCount >= 5 && !currentBadges.includes('constant_donor')) {
      addBadge({
        id: 'constant_donor',
        name: 'Donante Constante',
        icon: '🔥',
        description: 'Has apoyado 5 causas o más. ¡Increíble!'
      });
    }

    // 3. Embajador de la Comunidad
    if (user.impactScore >= 5000 && !currentBadges.includes('community_ambassador')) {
      addBadge({
        id: 'community_ambassador',
        name: 'Embajador',
        icon: '👑',
        description: 'Tu impacto es legendario en la comunidad.'
      });
    }
  }, [token.transactions.length, user.impactScore, addBadge, user.badges]);

  return (
    <GuisoCoreContext.Provider value={{
      user,
      token,
      global,
      levelUpNotification,
      activeImpactMoment,
      recordSupportTransaction,
      transferTokens,
      addActivity,
      updateProfile,
      addBadge,
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
