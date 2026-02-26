import React from 'react';
import { motion } from 'motion/react';
import { Shield, Award, ArrowUpRight, Activity } from 'lucide-react';
import { useIdentityStore } from './IdentityStore';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { Card } from '../../components/ui';
import { useTranslation } from '../../i18n';

export default function IdentityPanel() {
  const { user } = useGuisoCore();
  const { getIdentity } = useIdentityStore();
  const { t } = useTranslation();

  if (!user.walletAddress) {
    return null;
  }

  const identity = getIdentity(user.walletAddress);

  const getNextLevelThreshold = (currentTotal: number) => {
    if (currentTotal <= 100) return 101;
    if (currentTotal <= 500) return 501;
    if (currentTotal <= 1500) return 1501;
    if (currentTotal <= 5000) return 5001;
    return currentTotal; // Max level
  };

  const nextThreshold = getNextLevelThreshold(identity.totalImpact);
  const progress = identity.totalImpact >= 5000 
    ? 100 
    : (identity.totalImpact / nextThreshold) * 100;

  return (
    <Card variant="glass" padding="lg" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-guiso-dark flex items-center gap-2">
          <Shield className="text-guiso-orange" size={24} />
          {t('identity.title')}
        </h2>
        <div className="px-3 py-1 bg-guiso-orange/10 text-guiso-orange rounded-full text-xs font-bold uppercase tracking-wider">
          {t('identity.level')} {identity.impactLevel}
        </div>
      </div>

      <div className="text-center py-6 border-y border-gray-100">
        <p className="text-sm text-gray-500 font-medium mb-1">{t('identity.currentTitle')}</p>
        <h3 className="text-3xl font-display font-bold text-guiso-dark">
          {t(`identity.${identity.title.toLowerCase().replace(/\s+/g, '')}` as any) || identity.title}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500 font-medium">{t('identity.totalImpact')}</p>
            <p className="text-2xl font-bold text-guiso-orange">{identity.totalImpact} {t('common.pts')}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">{t('identity.nextLevel')}</p>
            <p className="text-sm font-bold text-gray-400">{identity.totalImpact >= 5000 ? t('identity.maxLevel') : `${nextThreshold} ${t('common.pts')}`}</p>
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-guiso-orange rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('identity.totalPayments')}</p>
            <p className="font-bold text-gray-900">{identity.totalPayments}</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('identity.certificates')}</p>
            <p className="font-bold text-gray-900">{identity.certificatesEarned}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
