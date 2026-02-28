import React, { createContext, useContext, useState } from "react";

interface DemoUIContextType {
  panelVisible: boolean;
  setPanelVisible: (visible: boolean) => void;
}

const DemoUIContext = createContext<DemoUIContextType | null>(null);

export const DemoUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panelVisible, setPanelVisible] = useState(true);

  return (
    <DemoUIContext.Provider value={{ panelVisible, setPanelVisible }}>
      {children}
    </DemoUIContext.Provider>
  );
};

export const useDemoUI = () => {
  const context = useContext(DemoUIContext);
  if (!context) {
    throw new Error("useDemoUI must be used within a DemoUIProvider");
  }
  return context;
};
