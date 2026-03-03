import React from 'react';
import { motion } from 'motion/react';
import { Heart, ExternalLink, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImpactEvent } from './types';
import { useTrustStore } from '../trust/TrustStore';

import { HTMLMotionProps } from 'motion/react';

interface ImpactEventCardProps extends HTMLMotionProps<"div"> {
  event: ImpactEvent;
}

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export default function ImpactEventCard({ event, ...props }: ImpactEventCardProps) {
  const { getTrustByTxHash } = useTrustStore();
  const trustProfile = getTrustByTxHash(event.txHash);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      {...props}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500 shrink-0">
          <Heart size={24} className="fill-current" />
        </div>
        <div>
          <h4 className="font-bold text-guiso-dark text-lg leading-tight flex items-center gap-2">
            {event.title}
            {trustProfile && trustProfile.trustScore >= 80 && (
              <Shield size={16} className="text-green-500" title={`Trust Score: ${trustProfile.trustScore}%`} />
            )}
            {trustProfile && trustProfile.trustScore < 50 && (
              <Shield size={16} className="text-red-500" title={`Trust Score: ${trustProfile.trustScore}%`} />
            )}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-mono">
              {event.walletShort}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {timeAgo(event.timestamp)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-4 mt-2 sm:mt-0">
        <div className="text-left sm:text-right">
          <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Impact</p>
          <p className="text-xl font-display font-bold text-green-500">+{event.impactAmount} pts</p>
        </div>
        <Link 
          to={`/impact/${event.certificateId}`}
          className="p-2 bg-gray-50 hover:bg-guiso-orange/10 text-gray-400 hover:text-guiso-orange rounded-xl transition-colors"
          title="View Certificate"
        >
          <ExternalLink size={20} />
        </Link>
      </div>
    </motion.div>
  );
}
