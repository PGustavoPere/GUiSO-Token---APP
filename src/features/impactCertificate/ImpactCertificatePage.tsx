import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Share2, CheckCircle2, ShieldAlert, Shield } from 'lucide-react';
import { impactCertificateService } from './impactCertificateService';
import { ImpactCertificate } from './types';
import ImpactShareCard from './ImpactShareCard';
import { Button } from '../../components/ui';
import { useTrustStore } from '../trust/TrustStore';

export default function ImpactCertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<ImpactCertificate | null>(null);
  const [showToast, setShowToast] = useState(false);
  const { getTrustByTxHash } = useTrustStore();

  useEffect(() => {
    if (certificateId) {
      const cert = impactCertificateService.getCertificate(certificateId);
      setCertificate(cert);
    }
  }, [certificateId]);

  const handleShare = () => {
    if (certificate) {
      navigator.clipboard.writeText(certificate.verificationUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Certificado no encontrado</h2>
          <p className="text-gray-500 mb-6">El ID del certificado es inválido o no existe.</p>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm mb-4">
              <CheckCircle2 size={18} />
              Impacto Verificado ✔
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-guiso-dark">
              Certificado de Impacto
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Este certificado verifica criptográficamente el impacto verificable generado a través de la red GUISO.
            </p>
          </div>

          <ImpactShareCard certificate={certificate} />

          {/* Impact Credibility Section */}
          {(() => {
            const trustProfile = getTrustByTxHash(certificate.txHash);
            if (!trustProfile) return null;

            const isVerified = trustProfile.trustScore >= 80;
            const isWarning = trustProfile.trustScore < 50;

            return (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
                <h3 className="text-lg font-bold text-guiso-dark mb-4 flex items-center gap-2">
                  <Shield size={20} className="text-blue-500" />
                  Credibilidad de Impacto
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Puntaje de Confianza del Comercio</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-3xl font-display font-bold ${
                        isVerified ? 'text-green-500' : isWarning ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {trustProfile.trustScore}%
                      </span>
                      {isVerified && (
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                          <ShieldCheck size={14} />
                          Comercio Verificado
                        </div>
                      )}
                      {isWarning && (
                        <div className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                          <ShieldAlert size={14} />
                          Confianza Baja
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Pagos Totales</p>
                    <p className="text-sm font-bold text-gray-700">{trustProfile.totalPayments}</p>
                    <p className="text-xs text-gray-400 mt-1">Impacto Generado</p>
                    <p className="text-sm font-bold text-guiso-orange">+{trustProfile.totalImpactGenerated} IP</p>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-center gap-4 mt-8">
            <Button 
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 size={20} />
              Compartir Impacto
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`https://testnet.bscscan.com/tx/${certificate.txHash}`, '_blank')}
            >
              Ver en BscScan
            </Button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50"
          >
            <CheckCircle2 size={18} className="text-green-400" />
            <span className="font-medium text-sm">Link de impacto copiado ✔</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
