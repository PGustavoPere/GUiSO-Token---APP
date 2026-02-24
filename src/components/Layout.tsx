import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Heart, Users, User, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGuiso } from '../context/GuisoContext';
import LevelUpNotification from './LevelUpNotification';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { balance, isWalletConnected } = useGuiso();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/impacto', icon: Heart, label: 'Impacto Social' },
    { to: '/comunidad', icon: Users, label: 'Comunidad' },
    { to: '/perfil', icon: User, label: 'Mi Perfil' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-guiso-orange rounded-lg flex items-center justify-center text-white font-bold">G</div>
          <span className="font-display font-bold text-lg">GUISO</span>
        </div>
        <div className="flex items-center gap-4">
          {isWalletConnected && (
            <span className="text-xs font-bold text-guiso-orange">{balance.toLocaleString()} GSO</span>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-guiso-orange rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-guiso-orange/20">G</div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl leading-none">GUISO</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Token Project</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-guiso-orange/10 text-guiso-orange font-semibold" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} className={cn("transition-transform group-hover:scale-110")} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-guiso-cream rounded-2xl p-4 border border-guiso-orange/10">
            <p className="text-xs text-gray-500 mb-2">Tu Balance</p>
            <div className="flex justify-between items-end">
              <span className="font-display font-bold text-lg">
                {isWalletConnected ? `${balance.toLocaleString()} GSO` : '---'}
              </span>
              {isWalletConnected && (
                <span className="text-[10px] text-green-500 font-bold uppercase">Activo</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 md:hidden bg-white pt-20 px-6"
          >
            <nav className="space-y-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 p-4 rounded-2xl text-lg",
                    isActive ? "bg-guiso-orange text-white font-bold" : "text-gray-600"
                  )}
                >
                  <item.icon size={24} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Global Notifications */}
      <LevelUpNotification />
    </div>
  );
}
