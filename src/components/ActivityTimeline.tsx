import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  ShoppingBag, 
  Vote, 
  ArrowDownLeft, 
  Award, 
  Clock,
  ExternalLink
} from 'lucide-react';
import { Transaction, ActivityType } from '../core/GuisoCoreStore';
import { Badge } from './ui';

interface ActivityTimelineProps {
  activities: Transaction[];
}

const getActivityConfig = (type: ActivityType) => {
  switch (type) {
    case 'support':
      return {
        icon: <Heart size={16} />,
        color: 'bg-guiso-orange/10 text-guiso-orange',
        label: 'Apoyo Social',
        actionLabel: 'Apoyaste a'
      };
    case 'purchase':
      return {
        icon: <ShoppingBag size={16} />,
        color: 'bg-blue-500/10 text-blue-500',
        label: 'Compra Local',
        actionLabel: 'Compraste en'
      };
    case 'vote':
      return {
        icon: <Vote size={16} />,
        color: 'bg-purple-500/10 text-purple-500',
        label: 'Votación',
        actionLabel: 'Votaste por'
      };
    case 'receive':
      return {
        icon: <ArrowDownLeft size={16} />,
        color: 'bg-green-500/10 text-green-500',
        label: 'Recepción',
        actionLabel: 'Recibiste de'
      };
    case 'level_up':
      return {
        icon: <Award size={16} />,
        color: 'bg-yellow-500/10 text-yellow-500',
        label: 'Nuevo Nivel',
        actionLabel: 'Alcanzaste'
      };
    default:
      return {
        icon: <Clock size={16} />,
        color: 'bg-gray-500/10 text-gray-500',
        label: 'Actividad',
        actionLabel: 'Acción en'
      };
  }
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Aún no hay historias que contar.</p>
        <p className="text-xs">Tus acciones de impacto aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-guiso-orange/20 before:via-gray-100 before:to-transparent">
      {activities.map((activity, index) => {
        const config = getActivityConfig(activity.type);
        const date = new Date(activity.date);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { day: 'numeric', month: 'short' });

        return (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-6 group"
          >
            {/* Icon Circle */}
            <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-sm shrink-0 transition-transform group-hover:scale-110 ${config.color}`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{config.label}</span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{dateStr}, {timeStr}</span>
                </div>
                {activity.impactPoints > 0 && (
                  <Badge variant="success" className="w-fit text-[10px] py-0 px-2">
                    +{activity.impactPoints} IP
                  </Badge>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium text-gray-400">{config.actionLabel}</span>{' '}
                  <span className="font-bold text-guiso-dark">{activity.target}</span>
                </p>
                
                {activity.description && (
                  <p className="text-xs text-gray-500 italic mb-3">"{activity.description}"</p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-guiso-orange">
                      {activity.amount > 0 ? `${activity.amount.toLocaleString()} GSO` : ''}
                    </span>
                  </div>
                  
                  {activity.txHash && (
                    <a 
                      href={`https://explorer.guiso.social/tx/${activity.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-500 hover:underline flex items-center gap-1"
                    >
                      Ver en Blockchain <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
