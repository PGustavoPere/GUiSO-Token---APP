/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * App.tsx - Punto de entrada principal de la aplicación GUISO.
 * Aquí se orquestan los proveedores de estado que dan vida al ecosistema:
 * - WalletProvider: Conexión con el mundo Web3.
 * - GuisoCoreProvider: El motor central de impacto y balance.
 * - Otros proveedores específicos para cada característica social.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GuisoCoreProvider } from './core/GuisoCoreStore';
import { WalletProvider } from './core/WalletProvider';
import { PaymentProvider } from './features/payments/PaymentStore';
import { MerchantProvider } from './features/merchant/MerchantStore';
import Layout from './components/Layout';
import WelcomeModal from './components/WelcomeModal';
import ScrollToTop from './components/ScrollToTop';
import DashboardPage from './features/dashboard/DashboardPage';
import ImpactPage from './features/impact/ImpactPage';
import ProfilePage from './features/profile/ProfilePage';
import VisionPage from './features/vision/VisionPage';
import PaymentPage from './features/payments/PaymentPage';
import MerchantDashboard from './features/merchant/MerchantDashboard';
import ImpactCertificatePage from './features/impactCertificate/ImpactCertificatePage';
import ImpactExplorerPage from './features/impactExplorer/ImpactExplorerPage';
import { ImpactExplorerProvider } from './features/impactExplorer/ImpactExplorerStore';
import { FiatBridgeProvider } from './features/fiatBridge/FiatBridgeStore';
import { TrustProvider } from './features/trust/TrustStore';
import { IdentityProvider } from './features/identity/IdentityStore';
import { CommunityProvider } from './features/community/CommunityStore';
import CommunityPage from './features/community/CommunityPage';

export default function App() {
  console.log("Router mounted");
  return (
    <WalletProvider>
      <GuisoCoreProvider>
        <PaymentProvider>
          <MerchantProvider>
            <TrustProvider>
              <FiatBridgeProvider>
                <ImpactExplorerProvider>
                  <IdentityProvider>
                    <CommunityProvider>
                      <BrowserRouter>
                        <WelcomeModal />
                        <ScrollToTop />
                        <Routes>
                          <Route path="/" element={<Layout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="impacto" element={<ImpactPage />} />
                            <Route path="comunidad" element={<CommunityPage />} />
                            <Route path="perfil" element={<ProfilePage />} />
                            <Route path="vision" element={<VisionPage />} />
                            <Route path="merchant" element={<MerchantDashboard />} />
                            <Route path="impact-explorer" element={<ImpactExplorerPage />} />
                          </Route>
                          <Route path="/pay/:paymentId" element={<PaymentPage />} />
                          <Route path="/impact/:certificateId" element={<ImpactCertificatePage />} />
                        </Routes>
                      </BrowserRouter>
                    </CommunityProvider>
                  </IdentityProvider>
                </ImpactExplorerProvider>
              </FiatBridgeProvider>
            </TrustProvider>
          </MerchantProvider>
        </PaymentProvider>
      </GuisoCoreProvider>
    </WalletProvider>
  );
}
