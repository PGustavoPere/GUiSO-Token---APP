import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

const data = [
  { name: 'Alimentación', value: 45, color: '#FF6321' },
  { name: 'Educación', value: 25, color: '#3b82f6' },
  { name: 'Salud', value: 20, color: '#10b981' },
  { name: 'Vivienda', value: 10, color: '#8b5cf6' },
];

export default function ImpactDistributionChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-gray-500">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
