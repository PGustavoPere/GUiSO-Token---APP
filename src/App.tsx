/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GuisoCoreProvider } from './core/GuisoCoreStore';
import { WalletProvider } from './core/WalletProvider';
import { PaymentProvider } from './features/payments/PaymentStore';
import Layout from './components/Layout';
import DashboardPage from './features/dashboard/DashboardPage';
import ImpactPage from './features/impact/ImpactPage';
import ProfilePage from './features/profile/ProfilePage';
import VisionPage from './features/vision/VisionPage';
import DemoWelcome from './components/DemoWelcome';
import DemoGuide from './components/DemoGuide';
import PaymentPage from './features/payments/PaymentPage';
import { Card, Button } from './components/ui';

// Placeholder for Community until implemented
const CommunityPage = () => (
  <div className="space-y-8">
    <header>
      <h1 className="text-4xl">Comunidad</h1>
      <p className="text-gray-500">Tu voz decide el próximo paso de GUISO.</p>
    </header>
    <Card variant="glass" padding="lg" className="text-center space-y-6">
      <div className="w-20 h-20 bg-guiso-orange/10 rounded-full flex items-center justify-center text-guiso-orange mx-auto">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h2 className="text-2xl font-display font-bold">Portal de Gobernanza en Desarrollo</h2>
      <p className="text-gray-500 max-w-md mx-auto">Estamos trabajando en un sistema de votación on-chain basado en Snapshot para asegurar que cada voto sea transparente e inmutable.</p>
      <div className="flex justify-center gap-4">
        <Button>Unirse a Discord</Button>
        <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">Ver Propuestas Pasadas</Button>
      </div>
    </Card>
  </div>
);

export default function App() {
  console.log("Router mounted");
  return (
    <WalletProvider>
      <GuisoCoreProvider>
        <PaymentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="impacto" element={<ImpactPage />} />
                <Route path="comunidad" element={<CommunityPage />} />
                <Route path="perfil" element={<ProfilePage />} />
                <Route path="vision" element={<VisionPage />} />
              </Route>
              <Route path="/pay/:paymentId" element={<PaymentPage />} />
            </Routes>
            <DemoWelcome />
            <DemoGuide />
          </BrowserRouter>
        </PaymentProvider>
      </GuisoCoreProvider>
    </WalletProvider>
  );
}
