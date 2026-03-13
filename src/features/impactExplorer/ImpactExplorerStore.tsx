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

    // Filter out demo events
    let updated = false;
    const filteredEvents = loadedEvents.filter(e => {
      if (e.meta?.demo) {
        updated = true;
        return false;
      }
      return true;
    });
    loadedEvents = filteredEvents;

    // Sync with existing certificates just in case
    const certs = impactCertificateService.getAllCertificates();
    const eventCertIds = new Set(loadedEvents.map(e => e.certificateId));
    
    certs.forEach(cert => {
      if (!eventCertIds.has(cert.id)) {
        loadedEvents.push({
          id: `EVT-${cert.id}`,
          certificateId: cert.id,
          title: cert.title,
          impactAmount: cert.impactAmount,
          timestamp: cert.createdAt,
          walletShort: `${cert.wallet.slice(0, 6)}...${cert.wallet.slice(-4)}`,
          txHash: cert.txHash,
          meta: cert.meta
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

  const syncWithCertificates = useCallback(() => {
    const saved = localStorage.getItem('guiso_impact_events');
    let loadedEvents: ImpactEvent[] = saved ? JSON.parse(saved) : [];
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
          txHash: cert.txHash,
          meta: cert.meta
        });
        updated = true;
      }
    });

    if (updated) {
      loadedEvents.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem('guiso_impact_events', JSON.stringify(loadedEvents));
      setEvents(loadedEvents);
    }
  }, []);

  // Sync on mount and listen for updates
  useEffect(() => {
    syncWithCertificates();
    
    const handleUpdate = () => {
      console.log("ImpactExplorerStore: Syncing with certificates...");
      syncWithCertificates();
    };

    window.addEventListener('certificates_updated', handleUpdate);
    return () => window.removeEventListener('certificates_updated', handleUpdate);
  }, [syncWithCertificates]);

  // Simulate real-time refresh every 5 seconds (reduced from 10)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('guiso_impact_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length !== events.length) {
          setEvents(parsed);
        }
      }
    }, 5000);
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
