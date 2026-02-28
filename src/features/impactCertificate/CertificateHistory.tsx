import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ExternalLink, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { impactCertificateService } from './impactCertificateService';
import { ImpactCertificate } from './types';
import { useWallet } from '../../core/WalletProvider';
import { Card } from '../../components/ui';

export default function CertificateHistory() {
  const { address, isConnected } = useWallet();
  const [certificates, setCertificates] = useState<ImpactCertificate[]>([]);

  useEffect(() => {
    const loadCerts = () => {
      if (isConnected && address) {
        setCertificates(impactCertificateService.getCertificatesByWallet(address));
      } else {
        setCertificates([]);
      }
    };

    loadCerts();

    const handleUpdate = () => loadCerts();
    window.addEventListener('certificates_updated', handleUpdate);
    return () => window.removeEventListener('certificates_updated', handleUpdate);
  }, [isConnected, address]);

  if (!isConnected) return null;

  return (
    <Card variant="glass" padding="md" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-guiso-orange/10 rounded-xl flex items-center justify-center text-guiso-orange">
          <Award size={20} />
        </div>
        <h3 className="text-xl font-display font-bold">My Impact Certificates</h3>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aún no tienes certificados de impacto.</p>
          <p className="text-sm mt-2">Realiza un pago o apoyo para generar tu primer certificado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Link key={cert.id} to={`/impact/${cert.id}`}>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 hover:border-guiso-orange/30 transition-colors group cursor-pointer"
                style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <ShieldCheck className="text-guiso-orange shrink-0" size={24} />
                  <span className="text-xs font-mono text-gray-400 shrink-0 ml-2">{new Date(cert.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-guiso-dark mb-1">{cert.title}</h4>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <p className="text-xs text-gray-500">Impacto Generado</p>
                    <p className="font-bold text-guiso-orange">{cert.impactAmount} pts</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-guiso-orange transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
