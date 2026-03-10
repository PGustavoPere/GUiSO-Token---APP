import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ImpactChart() {
  const { token } = useGuisoCore();

  // Generar datos para los últimos 7 días
  const data = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Sumar impacto de ese día
      const dayImpact = token.transactions
        .filter(t => t.date === dateStr)
        .reduce((acc, t) => acc + t.impactPoints, 0);
        
      return {
        name: format(date, 'EEE', { locale: es }),
        ip: dayImpact,
        date: dateStr
      };
    });

    // Si no hay datos, poner algunos de ejemplo para que no se vea vacío el MVP
    const hasData = last7Days.some(d => d.ip > 0);
    if (!hasData) {
      return [
        { name: 'Lun', ip: 120 },
        { name: 'Mar', ip: 80 },
        { name: 'Mie', ip: 250 },
        { name: 'Jue', ip: 150 },
        { name: 'Vie', ip: 300 },
        { name: 'Sab', ip: 200 },
        { name: 'Dom', ip: 100 },
      ];
    }

    return last7Days;
  }, [token.transactions]);

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6321" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FF6321" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            cursor={{ stroke: '#FF6321', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Area 
            type="monotone" 
            dataKey="ip" 
            stroke="#FF6321" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIp)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
