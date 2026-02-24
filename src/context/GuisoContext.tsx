import React, { createContext, useContext, useState, useEffect } from 'react';
import { impactEngine, LevelThreshold } from '../system/impactEngine';

interface Action {
  id: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  impactGenerated: number;
  date: string;
}

interface GlobalStats {
  totalImpactPoints: number;
  totalSupportedCauses: number;
  activeCommunityMembers: number;
  estimatedMealsSupported: number;
}

interface GuisoContextType {
  balance: number;
  impactScore: number;
  totalSupportedCauses: number;
  communityLevel: string;
  history: Action[];
  globalStats: GlobalStats;
  isWalletConnected: boolean;
  levelUpNotification: LevelThreshold | null;
  dismissNotification: () => void;
  connectWallet: () => void;
  supportProject: (projectId: string, projectTitle: string, amount: number) => void;
}

const GuisoContext = createContext<GuisoContextType | undefined>(undefined);

const INITIAL_GLOBAL_STATS: GlobalStats = {
  totalImpactPoints: 125400,
  totalSupportedCauses: 42,
  activeCommunityMembers: 856,
  estimatedMealsSupported: 15200,
};

export const GuisoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [impactScore, setImpactScore] = useState(0);
  const [history, setHistory] = useState<Action[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>(INITIAL_GLOBAL_STATS);
  const [levelUpNotification, setLevelUpNotification] = useState<LevelThreshold | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedUserData = localStorage.getItem('guiso_user_data');
    const savedGlobalData = localStorage.getItem('guiso_global_stats');

    if (savedUserData) {
      const parsed = JSON.parse(savedUserData);
      setBalance(parsed.balance);
      setImpactScore(parsed.impactScore);
      setHistory(parsed.history);
      setIsWalletConnected(true);
    }

    if (savedGlobalData) {
      setGlobalStats(JSON.parse(savedGlobalData));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isWalletConnected) {
      localStorage.setItem('guiso_user_data', JSON.stringify({ balance, impactScore, history }));
    }
    localStorage.setItem('guiso_global_stats', JSON.stringify(globalStats));
  }, [balance, impactScore, history, globalStats, isWalletConnected]);

  const connectWallet = () => {
    setIsWalletConnected(true);
  };

  const dismissNotification = () => {
    setLevelUpNotification(null);
  };

  const supportProject = (projectId: string, projectTitle: string, amount: number) => {
    if (amount > balance) return;

    const impactGenerated = impactEngine.calculateImpactPoints(amount);
    const mealsGenerated = impactEngine.calculateMeals(amount);
    
    const newAction: Action = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      projectTitle,
      amount,
      impactGenerated,
      date: new Date().toISOString().split('T')[0],
    };

    const newImpactScore = impactScore + impactGenerated;
    
    // Check for level up
    const currentLevel = impactEngine.calculateLevel(impactScore);
    const nextLevel = impactEngine.calculateLevel(newImpactScore);

    if (currentLevel.level !== nextLevel.level) {
      setLevelUpNotification(nextLevel);
    }

    setBalance(prev => prev - amount);
    setImpactScore(newImpactScore);
    setHistory(prev => [newAction, ...prev]);

    // Update Global Stats
    setGlobalStats(prev => ({
      ...prev,
      totalImpactPoints: prev.totalImpactPoints + impactGenerated,
      estimatedMealsSupported: prev.estimatedMealsSupported + mealsGenerated,
    }));
  };

  const totalSupportedCauses = new Set(history.map(a => a.projectId)).size;

  return (
    <GuisoContext.Provider value={{
      balance,
      impactScore,
      totalSupportedCauses,
      communityLevel: impactEngine.calculateLevel(impactScore).level,
      history,
      globalStats,
      isWalletConnected,
      levelUpNotification,
      dismissNotification,
      connectWallet,
      supportProject
    }}>
      {children}
    </GuisoContext.Provider>
  );
};

export const useGuiso = () => {
  const context = useContext(GuisoContext);
  if (!context) throw new Error('useGuiso must be used within a GuisoProvider');
  return context;
};
