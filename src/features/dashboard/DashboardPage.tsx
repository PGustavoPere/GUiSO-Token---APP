import React, { useEffect, useState } from 'react';
import { api, TokenStats } from '../../services/api';
import { TrendingUp, Users, Coins, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ImpactCounter from '../../components/ImpactCounter';

const mockChartData = [
  { name: 'Lun', price: 0.038 },
  { name: 'Mar', price: 0.040 },
  { name: 'Mie', price: 0.039 },
  { name: 'Jue', price: 0.041 },
  { name: 'Vie', price: 0.043 },
  { name: 'Sab', price: 0.042 },
  { name: 'Dom', price: 0.042 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTokenStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  const statCards = [
    { label: 'Precio GSO', value: `$${stats.price}`, change: `+${stats.priceChange24h}%`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Holders', value: stats.holders.toLocaleString(), change: '+12 hoy', icon: Users, color: 'text-blue-500' },
    { label: 'Market Cap', value: `$${(stats.marketCap / 1000000).toFixed(2)}M`, change: 'Estable', icon: BarChart3, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-10">
      <header className="hidden md:block">
        <h1 className="text-4xl mb-2">Dashboard del Token</h1>
        <p className="text-gray-500">Métricas de utilidad y salud del ecosistema GUISO.</p>
      </header>

      {/* Global Impact Banner */}
      <ImpactCounter />

      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card p-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">{card.label}</p>
              <h3 className="text-3xl font-display font-bold">{card.value}</h3>
              <div className="flex items-center gap-1 mt-2">
                {card.change.startsWith('+') ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                <span className={cn("text-xs font-bold", card.change.startsWith('+') ? "text-green-500" : "text-red-500")}>{card.change}</span>
              </div>
            </div>
            <div className={cn("p-3 rounded-xl bg-gray-50", card.color)}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-display font-bold">Evolución del Precio</h3>
            <p className="text-sm text-gray-500">Últimos 7 días</p>
          </div>
          <div className="flex gap-2">
            {['1D', '1W', '1M', 'ALL'].map(t => (
              <button key={t} className={cn("px-3 py-1 rounded-lg text-xs font-bold transition-colors", t === '1W' ? "bg-guiso-orange text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200")}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999'}} dy={10} />
              <YAxis hide domain={['dataMin - 0.005', 'dataMax + 0.005']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#F27D26', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="price" stroke="#F27D26" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Coins size={20} className="text-guiso-orange" />
            Distribución del Supply
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Supply Circulante</span>
              <span className="font-bold">{(stats.circulatingSupply / 1000000).toFixed(1)}M GSO</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-guiso-orange h-full" style={{ width: `${(stats.circulatingSupply / stats.totalSupply) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>0M</span>
              <span>Total: 100M GSO</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-guiso-dark text-white">
          <h3 className="text-lg font-display font-bold mb-2">¿Por qué GSO?</h3>
          <p className="text-sm text-gray-400 mb-6">Cada transacción contribuye directamente a la tesorería de impacto social, permitiendo que la comunidad financie proyectos reales sin intermediarios.</p>
          <button className="w-full py-3 bg-white text-guiso-dark font-bold rounded-xl hover:bg-guiso-orange hover:text-white transition-colors">
            Ver Whitepaper
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper for class names
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
