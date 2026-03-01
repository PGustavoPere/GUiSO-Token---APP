import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ImpactEvent } from './types';
import { impactCertificateService } from '../impactCertificate/impactCertificateService';

interface ImpactExplorerContextType {
  events: ImpactEvent[];
  addImpactEvent: (event: ImpactEvent) => void;
  getRecentEvents: () => ImpactEvent[];
  getEventById: (id: string) => ImpactEvent | undefined;
}

const ImpactExplorerContext = createContext<ImpactExplorerContextType | undefined>(undefined);

export const ImpactExplorerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<ImpactEvent[]>(() => {
    const saved = localStorage.getItem('guiso_impact_events');
    let loadedEvents: ImpactEvent[] = saved ? JSON.parse(saved) : [];

    // Sync with existing certificates just in case
    const certs = impactCertificateService.getAllCertificates();
    const eventCertIds = new Set(loadedEvents.map(e => e.certificateId));
    
    let updated = false;
    certs.forEach(cert => {
      if (!eventCertIds.has(cert.id)) {
        loadedEvents.push({
          id: `EVT-${cert.id}`,
          certificateId: cert.id,
          title: cert.title,
          impactAmount: cert.impactAmount,
          timestamp: cert.createdAt,
          walletShort: `${cert.wallet.slice(0, 6)}...${cert.wallet.slice(-4)}`,
          txHash: cert.txHash
        });
        updated = true;
      }
    });

    if (updated) {
      loadedEvents.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem('guiso_impact_events', JSON.stringify(loadedEvents));
    }
    
    return loadedEvents;
  });

  // Simulate real-time refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('guiso_impact_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length !== events.length) {
          setEvents(parsed);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [events.length]);

  const addImpactEvent = useCallback((event: ImpactEvent) => {
    setEvents(prev => {
      if (prev.some(e => e.id === event.id)) return prev;
      const newEvents = [event, ...prev].sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem('guiso_impact_events', JSON.stringify(newEvents));
      return newEvents;
    });
  }, []);

  const getRecentEvents = useCallback(() => {
    return [...events].sort((a, b) => b.timestamp - a.timestamp);
  }, [events]);

  const getEventById = useCallback((id: string) => {
    return events.find(e => e.id === id);
  }, [events]);

  return (
    <ImpactExplorerContext.Provider value={{
      events,
      addImpactEvent,
      getRecentEvents,
      getEventById
    }}>
      {children}
    </ImpactExplorerContext.Provider>
  );
};

export const useImpactExplorerStore = () => {
  const context = useContext(ImpactExplorerContext);
  if (!context) throw new Error('useImpactExplorerStore must be used within an ImpactExplorerProvider');
  return context;
};
