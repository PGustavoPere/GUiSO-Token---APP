import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Heart, Users, User, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useGuisoCore } from '../core/GuisoCoreStore';
import { useDemoStore } from '../features/demo/DemoStore';
import { useDemoBalance } from '../features/demo/demoWallet';
import { useGuidedDemo } from '../features/demoGuided/useGuidedDemo';
import { useWallet } from '../core/WalletProvider';
import LevelUpNotification from './LevelUpNotification';
import ImpactMoment from './ImpactMoment';
import { Globe, RotateCcw, Cpu, Store, Activity, Play } from 'lucide-react';
import { web3Bridge } from '../web3/web3Provider';
import { Button } from './ui';
import { useTranslation } from '../i18n';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { token, user, resetDemo: resetCoreDemo } = useGuisoCore();
  const { isDemoMode, resetDemo } = useDemoStore();
  const { resetGuidedDemo, lockNavigation } = useGuidedDemo();
  const { address, isConnected, connect, isConnecting } = useWallet();
  const { t } = useTranslation();
  const demoBalance = useDemoBalance();

  const currentBalance = isDemoMode ? demoBalance : token.gsoBalance;

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { to: '/impacto', icon: Heart, label: t('navigation.impact') },
    { to: '/comunidad', icon: Users, label: t('navigation.community') },
    { to: '/vision', icon: Globe, label: t('navigation.vision') },
    { to: '/perfil', icon: User, label: t('navigation.profile') },
    { to: '/merchant', icon: Store, label: t('navigation.merchant') },
    { to: '/impact-explorer', icon: Activity, label: t('navigation.explorer') },
    { to: '/demo', icon: Play, label: 'Modo Demo' },
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
          {isConnected || isDemoMode ? (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-guiso-orange uppercase tracking-tighter">{currentBalance.toLocaleString()} GSO</span>
              <span className="text-[8px] text-gray-400 font-mono">{isDemoMode ? 'DEMO_WALLET' : address}</span>
            </div>
          ) : (
            <Button 
              onClick={connect} 
              disabled={isConnecting}
              size="sm"
              className="text-[10px] px-3 py-1"
            >
              {isConnecting ? '...' : t('buttons.connect')}
            </Button>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto overflow-x-hidden">
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
              onClick={(e) => {
                if (lockNavigation) {
                  e.preventDefault();
                }
              }}
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

        <div className="p-4 mt-auto space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-guiso-orange" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bridge Status</span>
            </div>
            <button 
              onClick={() => {
                const newMode = web3Bridge.getMode() === 'simulation' ? 'web3' : 'simulation';
                web3Bridge.setMode(newMode);
                // Force re-render to show updated mode
                setIsMenuOpen(prev => prev);
              }}
              className="text-[8px] font-bold bg-guiso-orange/10 text-guiso-orange px-2 py-0.5 rounded-full uppercase hover:bg-guiso-orange/20 transition-colors cursor-pointer"
            >
              {web3Bridge.getMode()}
            </button>
          </div>

          <button
            onClick={() => {
              resetDemo();
              resetCoreDemo();
              resetGuidedDemo();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-gray-400 hover:text-guiso-orange transition-colors uppercase tracking-widest"
          >
            <RotateCcw size={12} />
            Reiniciar Demo
          </button>

          <div className="bg-guiso-cream rounded-2xl p-4 border border-guiso-orange/10">
            <p className="text-xs text-gray-500 mb-2">{t('common.wallet')}</p>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] text-gray-400 truncate">
                {isDemoMode ? 'DEMO_WALLET' : (isConnected ? address : t('errors.walletNotConnected'))}
              </span>
              <div className="flex justify-between items-end mt-1">
                <span className="font-display font-bold text-lg">
                  {isConnected || isDemoMode ? `${currentBalance.toLocaleString()} GSO` : '---'}
                </span>
                {isConnected || isDemoMode ? (
                  <span className="text-[10px] text-green-500 font-bold uppercase">{t('common.status')}</span>
                ) : (
                  <button 
                    onClick={connect}
                    disabled={isConnecting}
                    className="text-[10px] text-guiso-orange font-bold uppercase hover:underline"
                  >
                    {isConnecting ? t('common.loading') : t('buttons.connect')}
                  </button>
                )}
              </div>
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
            className="fixed inset-0 z-40 md:hidden bg-white pt-20 px-6 h-screen overflow-y-auto overflow-x-hidden flex flex-col pb-20"
          >
            <nav className="space-y-4 flex flex-col">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={(e) => {
                    if (lockNavigation) {
                      e.preventDefault();
                    } else {
                      setIsMenuOpen(false);
                    }
                  }}
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
        {children}
      </main>

      {/* Global Notifications */}
      <LevelUpNotification />
      <ImpactMoment />
    </div>
  );
}
