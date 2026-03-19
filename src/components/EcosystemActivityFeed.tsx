import React from 'react';
import { motion } from 'motion/react';
import { Heart, Shield, Award, PlusCircle, UserCheck, Clock } from 'lucide-react';
import { Card, Badge } from './ui';

interface ActivityEvent {
  id: string;
  type: 'support' | 'certificate' | 'level' | 'initiative';
  text: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

const ACTIVITIES: ActivityEvent[] = [
  {
    id: '1',
    type: 'support',
    text: 'Ana apoyó "Comedor Esperanza" (+10 IP)',
    time: 'hace 2 horas',
    icon: Heart,
    color: 'text-red-500 bg-red-50',
  },
  {
    id: '2',
    type: 'certificate',
    text: 'Se generó un certificado de impacto verificable',
    time: 'hace 3 horas',
    icon: Shield,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: '3',
    type: 'level',
    text: 'Carlos alcanzó nivel "Agente GUISO"',
    time: 'hace 5 horas',
    icon: Award,
    color: 'text-guiso-orange bg-guiso-orange/10',
  },
  {
    id: '4',
    type: 'initiative',
    text: 'Nueva iniciativa registrada: "Ronda Solidaria"',
    time: 'hace 8 horas',
    icon: PlusCircle,
    color: 'text-green-500 bg-green-50',
  },
  {
    id: '5',
    type: 'support',
    text: 'María apoyó "Olla Comunitaria Norte" (+15 IP)',
    time: 'hace 12 horas',
    icon: Heart,
    color: 'text-red-500 bg-red-50',
  },
  {
    id: '6',
    type: 'level',
    text: 'Juan se unió como "Validador Comunitario"',
    time: 'hace 1 día',
    icon: UserCheck,
    color: 'text-purple-500 bg-purple-50',
  },
];

export default function EcosystemActivityFeed() {
  return (
    <Card variant="glass" padding="md" rounded="3xl" className="border-guiso-orange/10">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-xl font-display font-bold text-guiso-dark">
          Actividad Reciente del Ecosistema
        </h3>
        <Badge variant="neutral" className="bg-gray-100 text-gray-500 border-none">
          En Vivo
        </Badge>
      </div>

      <div className="space-y-4">
        {ACTIVITIES.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activity.color}`}>
              <activity.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-guiso-dark leading-tight">
                {activity.text}
              </p>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <Clock size={10} />
                {activity.time}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-50 text-center">
        <p className="text-[10px] text-gray-400 italic">
          Esta actividad refleja el compromiso real de nuestra comunidad en tiempo real.
        </p>
      </div>
    </Card>
  );
}
