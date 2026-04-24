import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Zap, CheckCircle2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGuisoCore } from '../../core/GuisoCoreStore';
import { useWallet } from '../../core/WalletProvider';
import { Card, Button } from '../../components/ui';
import SupportModal from '../impact/SupportModal';
import { api, Project } from '../../services/api';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function DashboardPage() {
  const { user, token } = useGuisoCore();
  const { isConnected, connect, isConnecting } = useWallet();
  const navigate = useNavigate();
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    console.log("Dashboard: Fetching projects...");
    api.getProjects().then(data => {
      console.log("Dashboard: Received projects", data);
      setProjects(data);
      setLoading(false);
    }).catch(err => {
      console.error("Dashboard: Error fetching projects", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProjects();
    
    // Set up a polling interval for the MVP presentation to ensure real-time updates
    // even if the SSE stream has issues
    const interval = setInterval(fetchProjects, 5000);
    return () => clearInterval(interval);
  }, []);

  // Find the project in the current projects list to ensure we have the latest raised amount
  const highlightedProject = projects.find(p => p.id === "1") || projects[0] || {
    id: "1",
    title: "Un Lugar — General Cabrera",
    description: "Espacio comunitario que brinda desayuno, almuerzo y merienda a niños y niñas de 2 a 16 años.",
    status: "active",
    raised: 87500,
    goal: 150000,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop",
    category: "Infancia y Alimentación",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C9b4444"
  };

  const totalRaised = projects.reduce((acc, curr) => acc + curr.raised, 0);

  const recentDonations = [
    { name: "Juan", amount: 1000 },
    { name: "María", amount: 500 },
    { name: "Carlos", amount: 2000 },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-[2.5rem] md:rounded-[4rem] bg-guiso-dark p-8 md:p-24 text-white text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-guiso-orange blur-[150px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-guiso-terracotta blur-[130px]" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-bold leading-[1.05] tracking-tight"
          >
            Ayudá a personas reales, <br />
            <span className="text-guiso-orange">con total transparencia.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-2xl text-white/70 max-w-xl mx-auto leading-relaxed"
          >
            Doná en segundos y seguí exactamente a dónde va tu ayuda.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4"
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto px-12 py-8 text-xl shadow-2xl shadow-guiso-orange/20"
              onClick={() => document.getElementById('causas')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Donar ahora
            </Button>
            <button 
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white/60 hover:text-white font-bold transition-colors flex items-center gap-2 group"
            >
              Ver cómo funciona
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. SECCIÓN CAUSAS */}
      <section id="causas" className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900">Hoy podés ayudar acá 👇</h2>
        </div>

        <Card variant="glass" padding="none" className="overflow-hidden group border-none shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-72 md:h-auto overflow-hidden">
              <img 
                src={highlightedProject.image} 
                alt={highlightedProject.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-guiso-orange font-bold text-sm">
                  <MapPin size={18} />
                  {highlightedProject.category}
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-gray-900">{highlightedProject.title}</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                "{highlightedProject.description}"
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-guiso-orange font-bold text-xl">{highlightedProject.raised.toLocaleString()} GSO</span>
                  <span className="text-gray-400 text-sm">Meta: {highlightedProject.goal.toLocaleString()} GSO</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-guiso-orange transition-all duration-1000"
                    style={{ width: `${(highlightedProject.raised / highlightedProject.goal) * 100}%` }} 
                  />
                </div>
              </div>
              <Button 
                className="w-full py-6 text-lg"
                onClick={() => document.getElementById('donacion')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Donar a esta causa
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. SECCIÓN DONACIÓN */}
      <section id="donacion" className="bg-guiso-cream/30 py-24 rounded-[3rem] md:rounded-[5rem]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900">Elegí cuánto querés aportar</h2>
            <p className="text-gray-500 text-lg">Tu ayuda llega directamente a esta causa. Podés ver el impacto en tiempo real.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[500, 1000, 2000].map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setIsSupportModalOpen(true);
                }}
                className={cn(
                  "py-8 rounded-3xl text-2xl font-bold transition-all border-2",
                  selectedAmount === amount 
                    ? "bg-guiso-orange border-guiso-orange text-white shadow-xl shadow-guiso-orange/20 scale-105" 
                    : "bg-white border-gray-100 text-gray-900 hover:border-guiso-orange/30"
                )}
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {!isConnected ? (
              <Button 
                size="lg" 
                className="w-full py-8 text-xl bg-guiso-dark hover:bg-black"
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Conectando...' : 'Conectar Wallet para Donar'}
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="w-full py-8 text-xl"
                disabled={!selectedAmount || token.gsoBalance < (selectedAmount || 0)}
                onClick={() => setIsSupportModalOpen(true)}
              >
                {token.gsoBalance < (selectedAmount || 0) 
                  ? 'GSO Insuficientes' 
                  : 'Confirmar donación'}
              </Button>
            )}
            {isConnected && token.gsoBalance > 0 && (
              <p className="mt-4 text-xs text-gray-400 font-bold">
                Tu balance: <span className="text-guiso-orange">{token.gsoBalance.toLocaleString()} GSO</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN TRANSPARENCIA */}
      <section className="max-w-4xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900">Transparencia total</h2>
          <p className="text-gray-500 text-lg">Mirá cómo impacta tu ayuda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            {recentDonations.map((donation, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-guiso-orange/10 rounded-full flex items-center justify-center text-guiso-orange font-bold">
                    {donation.name[0]}
                  </div>
                  <p className="font-bold text-gray-900">{donation.name} donó</p>
                </div>
                <p className="text-guiso-orange font-bold text-xl">${donation.amount}</p>
              </motion.div>
            ))}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center px-2">
              <p className="text-gray-500 font-medium">Total recaudado:</p>
              <p className="text-3xl font-display font-bold text-guiso-orange">{totalRaised.toLocaleString()} GSO</p>
            </div>
          </div>
          <div className="bg-guiso-dark p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
            <ShieldCheck size={120} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
            <h4 className="text-2xl font-display font-bold">Seguridad Garantizada</h4>
            <p className="text-white/60 leading-relaxed">
              Cada centavo está registrado de forma inmutable. No hay intermediarios, no hay costos ocultos. Tu ayuda llega a quien más lo necesita.
            </p>
            <div className="flex items-center gap-3 text-guiso-orange font-bold">
              <CheckCircle2 size={20} />
              Verificado por la comunidad
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN "CÓMO FUNCIONA" */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900">¿Cómo funciona?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "1", title: "Elegís una causa real", desc: "Explorá los proyectos verificados que necesitan ayuda hoy mismo.", icon: <Heart className="text-guiso-orange" size={32} /> },
            { step: "2", title: "Hacés tu aporte", desc: "Doná de forma segura y rápida con el monto que prefieras.", icon: <Zap className="text-guiso-orange" size={32} /> },
            { step: "3", title: "Ves el impacto de tu ayuda", desc: "Recibí actualizaciones y comprobantes de cómo se usó tu dinero.", icon: <Sparkles className="text-guiso-orange" size={32} /> },
          ].map((item, idx) => (
            <div key={idx} className="relative p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-guiso-dark text-white rounded-full flex items-center justify-center font-bold text-xl">
                {item.step}
              </div>
              <div className="mb-6">{item.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h4>
              <p className="text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SECCIÓN FINAL (CTA) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-guiso-orange p-12 md:p-24 rounded-[3rem] md:rounded-[5rem] text-white text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[100%] rounded-full bg-white blur-[120px]" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-tight">
              Cada pequeño aporte <br /> puede cambiar una vida.
            </h2>
            <p className="text-xl md:text-2xl text-white/80 font-medium">Sumate hoy y sé parte del cambio.</p>
          </div>

          <div className="relative z-10">
            <Button 
              size="lg" 
              variant="secondary" 
              className="px-16 py-8 text-2xl bg-white text-guiso-orange hover:bg-guiso-cream shadow-2xl"
              onClick={() => document.getElementById('causas')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Donar ahora
            </Button>
          </div>
        </div>
      </section>

      {isSupportModalOpen && (
        <SupportModal 
          project={highlightedProject}
          initialAmount={selectedAmount || 100}
          onClose={() => setIsSupportModalOpen(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}
