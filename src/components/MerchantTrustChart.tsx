import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MerchantTrustChart({ currentScore }: { currentScore: number }) {
  // Generar datos de confianza simulados que terminan en el score actual
  const data = React.useMemo(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const date = subDays(new Date(), 9 - i);
      // Simular una evolución hacia el score actual
      const variance = Math.floor(Math.random() * 10) - 5;
      const baseScore = Math.max(0, Math.min(100, currentScore - (9 - i) * 2 + variance));
      
      return {
        name: format(date, 'dd MMM', { locale: es }),
        score: i === 9 ? currentScore : baseScore
      };
    });
  }, [currentScore]);

  return (
    <div className="h-[150px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: '#9ca3af' }}
          />
          <YAxis 
            domain={[0, 100]}
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: '#9ca3af' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '10px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '10px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
