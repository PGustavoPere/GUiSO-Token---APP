import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Store, Plus, Wallet, CheckCircle2, Clock, XCircle, Shield, ArrowUpRight, Banknote } from 'lucide-react';
import { useMerchantStore } from './MerchantStore';
import { usePaymentStore } from '../payments/PaymentStore';
import { useTrustStore } from '../trust/TrustStore';
import { PaymentIntent } from '../payments/types';
import { useWallet } from '../../core/WalletProvider';
import { Card, Button, Badge } from '../../components/ui';
import CreatePaymentModal from './CreatePaymentModal';
import { convertGuisoToFiat, FIAT_SYMBOL, TOKEN_SYMBOL } from '../../core/economy';

export default function MerchantDashboard() {
  const { merchant, registerMerchant, isMerchant, loading } = useMerchantStore();
  const { payments, confirmPayment } = usePaymentStore();
  const { getMerchantTrust } = useTrustStore();
  const { isConnected, connect, address } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [prevCompletedCount, setPrevCompletedCount] = useState<number | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = async (id: string) => {
    if (verifyingId) return;
    setVerifyingId(id);
    try {
      // 1. Update Server
      const success = await confirmPayment(id);
      if (success) {
        // 2. Update Firestore for real-time customer view sync
        try {
          const { db } = await import('../../lib/firebase');
          const { doc, updateDoc } = await import('firebase/firestore');
          await updateDoc(doc(db, 'payments', id), {
            status: 'completed',
            updatedAt: Date.now()
          });
        } catch (fsErr) {
          console.warn("Could not sync Firestore status, but server is updated:", fsErr);
        }
      } else {
        alert("Error al verificar el pago.");
      }
    } finally {
      setVerifyingId(null);
    }
  };

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
    
    if (prevCompletedCount !== null && currentCompletedCount > prevCompletedCount) {
      playSuccessSound();
    }
    setPrevCompletedCount(currentCompletedCount);
  }, [payments, merchant, prevCompletedCount]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Portal de Comercios</h1>
        <Card variant="glass" padding="xl" className="text-center space-y-6">
          <div className="w-20 h-20 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange">
            <Wallet size={32} />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold mb-2">Súmate como Comercio</h3>
            <p className="text-gray-500 max-w-md mx-auto">Para empezar a recibir ayuda y colaborar con GUISO, necesitas conectar tu billetera digital.</p>
          </div>
          <Button onClick={connect} className="px-8 py-3">Conectar Wallet</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-12 h-12 border-4 border-guiso-orange/20 border-t-guiso-orange rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Verificando estado del comercio...</p>
      </div>
    );
  }

  if (!isMerchant) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold">Portal de Comercios</h1>
        <Card variant="glass" padding="xl" className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-guiso-orange/10 rounded-full flex items-center justify-center mx-auto text-guiso-orange mb-4">
              <Store size={24} />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Registra tu Negocio</h3>
            <p className="text-gray-500 text-sm">Comienza a recibir aportes con transparencia verificable.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Nombre del Negocio</label>
              <input 
                type="text" 
                value={regName}
                onChange={(e) => {
                  setRegName(e.target.value);
                  setRegError(null);
                }}
                placeholder="Ej. Panadería La Unión"
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-guiso-orange/20"
                disabled={isRegistering}
              />
            </div>

            {regError && (
              <p className="text-xs text-red-500 font-medium">{regError}</p>
            )}

            <Button 
              onClick={async () => {
                if (!regName || isRegistering) return;
                setIsRegistering(true);
                setRegError(null);
                try {
                  await registerMerchant(regName);
                } catch (err: any) {
                  console.error("Registration error:", err);
                  setRegError("Error al registrar: " + (err.message || "Intente nuevamente"));
                  setIsRegistering(false);
                }
              }}
              disabled={!regName || isRegistering}
              className="w-full"
            >
              {isRegistering ? 'Registrando...' : 'Registrar Comercio'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const merchantPayments = (Object.values(payments) as PaymentIntent[])
    .filter(p => p.walletAddress === merchant?.walletAddress)
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalGsoEarned = merchantPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.tokenAmount, 0);

  const totalFiatValue = convertGuisoToFiat(totalGsoEarned);

  const trustProfile = merchant ? getMerchantTrust(merchant.walletAddress) : null;
  const trustScore = trustProfile?.trustScore || 50;
  const trustColor = trustScore >= 80 ? 'bg-green-500' : trustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const trustTextColor = trustScore >= 80 ? 'text-green-500' : trustScore >= 50 ? 'text-yellow-500' : 'text-red-500';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={12}/> Pagado</Badge>;
      case 'awaiting_payment': return <Badge variant="primary" className="flex items-center gap-1 animate-pulse"><Clock size={12}/> Esperando Pago</Badge>;
      case 'confirming': return <Badge variant="primary" className="flex items-center gap-1 animate-pulse"><Clock size={12}/> Confirmando</Badge>;
      case 'failed': return <Badge variant="danger" className="flex items-center gap-1"><XCircle size={12}/> Fallido</Badge>;
      case 'expired': return <Badge variant="neutral" className="flex items-center gap-1"><Clock size={12}/> Expirado</Badge>;
      default: return <Badge variant="neutral" className="flex items-center gap-1"><Clock size={12}/> {status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-guiso-dark">{merchant?.name}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Conectado: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-guiso-orange/20">
          <Plus size={20} /> Crear Cobro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass" padding="md" className="space-y-4 border-l-4 border-l-guiso-orange">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-guiso-orange">
              <Banknote size={20} />
              <h3 className="font-bold uppercase tracking-wider text-xs">Balance Liquidable</h3>
            </div>
            <Badge variant="neutral">{FIAT_SYMBOL}</Badge>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-guiso-dark">
              ${totalFiatValue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Equivalente a {totalGsoEarned.toLocaleString()} {TOKEN_SYMBOL}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 text-sm"
            onClick={() => alert('Esta funcionalidad enviará una solicitud de liquidación a la tesorería de GUISO. Recibirás tus ARS en tu cuenta bancaria vinculada.')}
          >
            <ArrowUpRight size={16} /> Solicitar Liquidación
          </Button>
        </Card>

        {trustProfile && (
          <Card variant="glass" padding="md" className="space-y-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} className={trustTextColor} />
                Nivel de Confianza
              </h3>
              <span className={`text-xl font-display font-bold ${trustTextColor}`}>
                {trustScore}%
              </span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`h-2 rounded-full ${trustColor}`} style={{ width: `${trustScore}%` }}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Ventas</p>
                <p className="font-bold text-sm text-gray-700">{trustProfile.successfulPayments}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Impacto</p>
                <p className="font-bold text-sm text-guiso-orange">+{trustProfile.totalImpactGenerated}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Estado</p>
                <p className="font-bold text-sm text-green-500">Activo</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card variant="glass" padding="md" className="space-y-6">
        <h3 className="text-xl font-display font-bold">Cobros Recientes</h3>
        
        {merchantPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p>Aún no has creado ningún cobro.</p>
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
                  <div className="flex items-center gap-2">
                    {getStatusBadge(payment.status)}
                    {payment.status === 'awaiting_payment' && (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="py-1 px-3 text-[10px] h-auto"
                        onClick={() => handleVerify(payment.id)}
                        disabled={verifyingId === payment.id}
                      >
                        {verifyingId === payment.id ? '...' : 'Verificar'}
                      </Button>
                    )}
                  </div>
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
