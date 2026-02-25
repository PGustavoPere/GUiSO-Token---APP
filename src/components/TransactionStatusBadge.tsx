import React from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from './ui';

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'failed';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
  txHash?: string | null;
}

export default function TransactionStatusBadge({ status, txHash }: TransactionStatusBadgeProps) {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          text: 'Enviando...',
          variant: 'warning' as const,
        };
      case 'confirming':
        return {
          icon: <Clock className="w-3 h-3 animate-pulse" />,
          text: 'Confirmando...',
          variant: 'warning' as const,
        };
      case 'confirmed':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Confirmado',
          variant: 'success' as const,
        };
      case 'failed':
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: 'Fallido',
          variant: 'neutral' as const,
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-2 mt-4"
    >
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        {config.icon}
        {config.text}
      </Badge>
      
      {txHash && (
        <div className="p-3 bg-white/50 rounded-xl border border-gray-100 w-full text-center">
          <p className="text-xs text-gray-500 font-bold mb-1">Transaction Hash</p>
          <a 
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-guiso-orange hover:underline break-all"
          >
            {txHash}
          </a>
        </div>
      )}
    </motion.div>
  );
}
