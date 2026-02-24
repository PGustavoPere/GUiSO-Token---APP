import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const supportProject = (projectId: string, projectTitle: string, amount: number) => {
    if (amount > balance) return;

    const impactGenerated = Math.floor(amount * 0.1);
    const mealsGenerated = Math.floor(amount / 50); // Symbolic: 50 GSO = 1 meal
    
    const newAction: Action = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      projectTitle,
      amount,
      impactGenerated,
      date: new Date().toISOString().split('T')[0],
    };

    setBalance(prev => prev - amount);
    setImpactScore(prev => prev + impactGenerated);
    setHistory(prev => [newAction, ...prev]);

    // Update Global Stats
    setGlobalStats(prev => ({
      ...prev,
      totalImpactPoints: prev.totalImpactPoints + impactGenerated,
      estimatedMealsSupported: prev.estimatedMealsSupported + mealsGenerated,
      // If it's a new cause for the user, we could increment totalSupportedCauses globally 
      // but for simulation we'll just keep it as a growing number
    }));
  };

  const totalSupportedCauses = new Set(history.map(a => a.projectId)).size;

  const getCommunityLevel = () => {
    if (impactScore > 500) return 'Guerrero de la Comunidad';
    if (impactScore > 200) return 'Colaborador Senior';
    if (impactScore > 50) return 'Iniciador Social';
    return 'Nuevo Miembro';
  };

  return (
    <GuisoContext.Provider value={{
      balance,
      impactScore,
      totalSupportedCauses,
      communityLevel: getCommunityLevel(),
      history,
      globalStats,
      isWalletConnected,
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
