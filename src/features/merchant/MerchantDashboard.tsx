import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Store, Plus, Wallet, CheckCircle2, Clock, XCircle, Shield, ShieldAlert, ShieldCheck, Award } from 'lucide-react';
import { useMerchantStore } from './MerchantStore';
import { usePaymentStore } from '../payments/PaymentStore';
import { useTrustStore } from '../trust/TrustStore';
import { getTrustLevel, getTrustLevelMeta } from '../trust/trustLevelEngine';
import { PaymentIntent } from '../payments/types';
import { useWallet } from '../../core/WalletProvider';
import { Card, Button, Badge } from '../../components/ui';
import CreatePaymentModal from './CreatePaymentModal';
import { useTranslation } from '../../i18n';

export default function MerchantDashboard() {
  const { merchant, registerMerchant, isMerchant } = useMerchantStore();
  const { payments } = usePaymentStore();
  const { getMerchantTrust } = useTrustStore();
  const { isConnected, connect, address } = useWallet();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  // Audio for success
  const playSuccessSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    if (!merchant) return;
    const currentCompletedCount = (Object.values(payments) as PaymentIntent[]).filter(
      p => p.walletAddress === merchant.walletAddress && p.status === 'completed'
    ).length;
    
    if (currentCompletedCount > prevCompletedCount && prevCompletedCount > 0) {
      playSuccessSound();
    }
    setPrevCompletedCount(currentCompletedCount);
  }, [payments, merchant, prevCompletedCount]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t('merchant.portal')}</h1>
        <Card variant="glass" padding="xl" className="text-center space-y-6">
          <div className="w-20 h-20 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange">
            <Wallet size={32} />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold mb-2">{t('navigation.connectWallet')}</h3>
            <p className="text-gray-500 max-w-md mx-auto">{t('merchant.connectPrompt')}</p>
          </div>
          <Button onClick={connect} className="px-8 py-3">{t('navigation.connectWallet')}</Button>
        </Card>
      </div>
    );
  }

  if (!isMerchant) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t('merchant.portal')}</h1>
        <Card variant="glass" padding="xl" className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange mb-4">
              <Store size={24} />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">{t('merchant.register')}</h3>
            <p className="text-gray-500 text-sm">{t('merchant.registerDesc')}</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">{t('merchant.merchantName')}</label>
              <input 
                type="text" 
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={t('merchant.merchantNamePlaceholder')}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
              />
            </div>
            <Button 
              onClick={() => registerMerchant(regName)}
              disabled={!regName}
              className="w-full"
            >
              {t('merchant.registerButton')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const merchantPayments = (Object.values(payments) as PaymentIntent[])
    .filter(p => p.walletAddress === merchant?.walletAddress)
    .sort((a, b) => b.createdAt - a.createdAt);

  const trustProfile = merchant ? getMerchantTrust(merchant.walletAddress) : null;
  const trustScore = trustProfile?.trustScore || 50;
  const trustColor = trustScore >= 80 ? 'bg-green-500' : trustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const trustTextColor = trustScore >= 80 ? 'text-green-500' : trustScore >= 50 ? 'text-yellow-500' : 'text-red-500';
  
  const trustLevel = getTrustLevel(trustScore);
  const trustLevelMeta = getTrustLevelMeta(trustLevel);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={12}/> {t('payments.completed')}</Badge>;
      case 'pending':
      case 'confirming': return <Badge variant="primary" className="flex items-center gap-1 animate-pulse"><Clock size={12}/> {t('payments.processing')}</Badge>;
      case 'failed': return <Badge variant="danger" className="flex items-center gap-1"><XCircle size={12}/> {t('payments.failed')}</Badge>;
      case 'expired': return <Badge variant="neutral" className="flex items-center gap-1"><Clock size={12}/> {t('payments.expired')}</Badge>;
      default: return <Badge variant="neutral" className="flex items-center gap-1"><Clock size={12}/> {t('payments.waiting')}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-guiso-dark">{merchant?.name}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {t('merchant.connected')}: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-guiso-orange/20">
          <Plus size={20} /> {t('payments.createPayment')}
        </Button>
      </div>

      {trustProfile && (
        <Card variant="glass" padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-guiso-dark flex items-center gap-2">
                <Shield size={20} className={trustTextColor} />
                Trust Score
              </h3>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-50 border border-gray-100 ${trustLevelMeta.color}`}>
                {trustLevelMeta.icon === 'ShieldAlert' && <ShieldAlert size={14} />}
                {trustLevelMeta.icon === 'Shield' && <Shield size={14} />}
                {trustLevelMeta.icon === 'ShieldCheck' && <ShieldCheck size={14} />}
                {trustLevelMeta.icon === 'Award' && <Award size={14} />}
                {trustLevelMeta.label}
              </div>
            </div>
            <span className={`text-2xl font-display font-bold ${trustTextColor}`}>
              {trustScore}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${trustColor}`} style={{ width: `${trustScore}%` }}></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center pt-2">
            <div>
              <p className="text-xs text-gray-400">{t('trust.successfulPayments')}</p>
              <p className="font-bold text-gray-700">{trustProfile.successfulPayments}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('trust.failedPayments')}</p>
              <p className="font-bold text-gray-700">{trustProfile.failedPayments}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">{t('trust.impactGenerated')}</p>
              <p className="font-bold text-guiso-orange">+{trustProfile.totalImpactGenerated}</p>
            </div>
          </div>
        </Card>
      )}

      <Card variant="glass" padding="md" className="space-y-6">
        <h3 className="text-xl font-display font-bold">{t('payments.recentPayments')}</h3>
        
        {merchantPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p>{t('payments.noPayments')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {merchantPayments.map(payment => (
              <motion.div 
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white rounded-2xl border border-gray-100 gap-4"
              >
                <div>
                  <p className="font-bold text-guiso-dark">{payment.description}</p>
                  <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="font-bold text-guiso-orange">{payment.tokenAmount} GSO</p>
                    <p className="text-xs text-gray-400">${payment.fiatAmount} ARS</p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {isModalOpen && <CreatePaymentModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
