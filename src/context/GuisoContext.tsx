import React, { createContext, useContext, useState, useEffect } from 'react';

interface Action {
  id: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  impactGenerated: number;
  date: string;
}

interface GuisoContextType {
  balance: number;
  impactScore: number;
  totalSupportedCauses: number;
  communityLevel: string;
  history: Action[];
  isWalletConnected: boolean;
  connectWallet: () => void;
  supportProject: (projectId: string, projectTitle: string, amount: number) => void;
}

const GuisoContext = createContext<GuisoContextType | undefined>(undefined);

export const GuisoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [balance, setBalance] = useState(10000); // Balance inicial simulado
  const [impactScore, setImpactScore] = useState(0);
  const [history, setHistory] = useState<Action[]>([]);

  // Cargar datos de localStorage al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('guiso_user_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setBalance(parsed.balance);
      setImpactScore(parsed.impactScore);
      setHistory(parsed.history);
      setIsWalletConnected(true);
    }
  }, []);

  // Guardar datos en localStorage cada vez que cambien
  useEffect(() => {
    if (isWalletConnected) {
      localStorage.setItem('guiso_user_data', JSON.stringify({ balance, impactScore, history }));
    }
  }, [balance, impactScore, history, isWalletConnected]);

  const connectWallet = () => {
    setIsWalletConnected(true);
  };

  const supportProject = (projectId: string, projectTitle: string, amount: number) => {
    if (amount > balance) return;

    const impactGenerated = Math.floor(amount * 0.1); // 10% del monto se convierte en puntos de impacto
    
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
