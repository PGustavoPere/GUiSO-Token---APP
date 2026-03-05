import React from 'react';
import { ImpactCertificate } from './types';
import { ShieldCheck, ExternalLink, CheckCircle2, Link as LinkIcon, Award } from 'lucide-react';
import { useIdentityStore } from '../identity/IdentityStore';

interface ImpactShareCardProps {
  certificate: ImpactCertificate;
}

export default function ImpactShareCard({ certificate }: ImpactShareCardProps) {
  const { getIdentity } = useIdentityStore();
  const identity = getIdentity(certificate.wallet);

  return (
    <div className="bg-gradient-to-br from-guiso-orange to-orange-600 p-1 rounded-3xl shadow-2xl max-w-md mx-auto transform transition-all hover:scale-[1.02]">
      <div className="bg-white rounded-[1.4rem] p-8 text-center relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-guiso-orange rounded-full -translate-x-16 -translate-y-16 blur-2xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-600 rounded-full translate-x-16 translate-y-16 blur-2xl" />
        </div>

        <ShieldCheck className="w-16 h-16 text-guiso-orange mx-auto mb-4" />
        
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
          Impacto Verificado por GUISO
        </h3>
        
        <h2 className="text-3xl font-display font-bold text-guiso-dark mb-6 leading-tight">
          {certificate.title}
        </h2>
        
        <div className="bg-orange-50 rounded-2xl p-4 mb-4 border border-orange-100">
          <p className="text-sm text-orange-600 font-bold mb-1">Impacto Generado</p>
          <p className="text-4xl font-display font-bold text-guiso-orange">
            {certificate.impactAmount} <span className="text-lg">pts</span>
          </p>
        </div>

        <div className="bg-guiso-cream/50 rounded-xl p-4 mb-6 border border-guiso-orange/10">
          <p className="text-sm text-guiso-dark font-medium text-center">
            Esta transacción contribuyó al apoyo humanitario real.
          </p>
        </div>
        
        <div className="space-y-3 text-left bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
            <span className="text-xs text-gray-500 font-bold">ID del Certificado</span>
            <span className="text-xs font-mono text-gray-900">{certificate.id}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
            <span className="text-xs text-gray-500 font-bold">Fecha</span>
            <span className="text-xs text-gray-900">
              {new Date(certificate.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/50">
            <span className="text-xs text-gray-500 font-bold">Billetera</span>
            <span className="text-xs font-mono text-gray-900">
              {certificate.wallet.slice(0, 6)}...{certificate.wallet.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-bold">Identidad</span>
            <span className="text-xs font-bold text-guiso-orange flex items-center gap-1">
              <Award size={12} />
              {identity.title}
            </span>
          </div>
        </div>

        <div className="text-left bg-blue-50/50 rounded-xl p-5 border border-blue-100 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-blue-500" />
            <h4 className="text-sm font-bold text-blue-900">Verificación en Blockchain</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700/70 font-bold">Blockchain</span>
              <span className="text-xs font-medium text-blue-900 flex items-center gap-1">
                BNB Smart Chain <CheckCircle2 size={12} className="text-green-500" />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700/70 font-bold">Estado</span>
              <span className="text-xs font-medium text-blue-900">Confirmado</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-700/70 font-bold">Red</span>
              <span className="text-xs font-medium text-blue-900">BSC Testnet</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-blue-200/50">
              <span className="text-xs text-blue-700/70 font-bold">Transacción</span>
              <a 
                href={`https://testnet.bscscan.com/tx/${certificate.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
              >
                {certificate.txHash.slice(0, 6)}...{certificate.txHash.slice(-4)}
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
          <p className="text-[10px] text-gray-400 font-mono flex items-center justify-center gap-1">
            <LinkIcon size={12} />
            {certificate.verificationUrl.replace(/^https?:\/\//, '')}
          </p>
          <p className="text-[9px] text-gray-400 max-w-[250px] mx-auto leading-relaxed">
            Impacto verificado mediante confirmación en blockchain y el protocolo de transparencia GUISO.
          </p>
        </div>
      </div>
    </div>
  );
}
