import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Activity } from 'lucide-react';
import { useImpactExplorerStore } from './ImpactExplorerStore';
import { useTrustStore } from '../trust/TrustStore';
import { getTrustLevel, getTrustLevelMeta } from '../trust/trustLevelEngine';
import ImpactEventCard from './ImpactEventCard';
import { useTranslation } from '../../i18n';

export default function ImpactExplorerPage() {
  const { getRecentEvents } = useImpactExplorerStore();
  const { getTrustByTxHash } = useTrustStore();
  const { t } = useTranslation();
  
  const events = getRecentEvents().sort((a, b) => {
    const trustA = getTrustByTxHash(a.txHash);
    const trustB = getTrustByTxHash(b.txHash);
    
    const scoreA = trustA?.trustScore || 0;
    const scoreB = trustB?.trustScore || 0;
    
    const levelA = getTrustLevel(scoreA);
    const levelB = getTrustLevel(scoreB);
    
    const priorityA = getTrustLevelMeta(levelA).priority;
    const priorityB = getTrustLevelMeta(levelB).priority;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    return b.timestamp - a.timestamp;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-2xl mb-2">
          <Globe size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-guiso-dark">
          {t('navigation.explorer')}
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          {t('impact.explorerDesc')}
        </p>
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-bold">
          <Activity size={16} className="animate-pulse" />
          {t('impact.liveActivity')}
        </div>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-3xl border border-gray-100">
            <Globe size={48} className="mx-auto mb-4 text-guiso-orange/20" />
            <p className="text-lg font-medium text-gray-500">{t('impact.noEvents')}</p>
          </div>
        ) : (
          <AnimatePresence>
            {events.map((event: any) => (
              <ImpactEventCard key={event.id} event={event} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
