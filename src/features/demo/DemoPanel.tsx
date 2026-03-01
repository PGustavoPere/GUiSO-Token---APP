import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RefreshCw, Smartphone, QrCode, X } from 'lucide-react';
import { useDemoStore } from './DemoStore';
import { useDemoUI } from './DemoUIStore';
import { useGuidedDemo } from '../demoGuided/useGuidedDemo';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { useDemoEngine, demoEngine as globalDemoEngine } from '../../demo/demoEngine';

import { useGuisoCore } from '../../core/GuisoCoreStore';

export default function DemoPanel() {
  const { isDemoMode, session, startDemo, resetDemo: resetStoreDemo, createDemoPayment } = useDemoStore();
  const { panelVisible, setPanelVisible } = useDemoUI();
  const { resetGuidedDemo, isActive, currentStep, goNext } = useGuidedDemo();
  const { resetDemo: resetCoreDemo } = useGuisoCore();
  const navigate = useNavigate();
  const demoEngine = useDemoEngine();

  React.useEffect(() => {
    if (demoEngine.state === "processing") {
      const timer = setTimeout(() => {
        globalDemoEngine.setDemoState("certificate_generating");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (demoEngine.state === "certificate_generating") {
      const timer = setTimeout(() => {
        globalDemoEngine.generateDemoCertificate();
        globalDemoEngine.setDemoState("completed");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [demoEngine.state]);

  if (!isDemoMode) return null;

  if (!panelVisible) {
    return (
      <button
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        onClick={() => setPanelVisible(true)}
      >
        <Play size={18} className="fill-white" />
        <span className="font-bold">Demo</span>
      </button>
    );
  }

  const handleSimulateClient = () => {
    if (session?.demoPaymentId) {
      navigate(`/pay/${session.demoPaymentId}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 right-6 z-[100] bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden w-80"
      >
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Play size={18} className="fill-white" />
            <h3 className="font-bold">Panel de Demo</h3>
          </div>
          <button onClick={() => setPanelVisible(false)} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Comercio:</strong> Comedor Esperanza</p>
            <p><strong>Estado:</strong> {demoEngine.state === 'idle' ? 'Esperando...' : demoEngine.state === 'payment_created' ? 'Pago Creado' : demoEngine.state === 'processing' ? 'Procesando...' : demoEngine.state === 'certificate_generating' ? 'Generando Certificado...' : 'Completado'}</p>
          </div>

          <div className="space-y-2">
            <Button 
              data-demo-target="create-payment"
              onClick={() => {
                demoEngine.createPayment();
                const id = createDemoPayment();
                if (id) navigate(`/merchant`);
                if (isActive && currentStep === 2) goNext();
              }}
              className="w-full justify-start"
              variant={demoEngine.state !== 'idle' ? 'outline' : 'primary'}
            >
              <QrCode size={18} className="mr-2" />
              1. Crear Pago Demo
            </Button>
            
            <Button 
              data-demo-target="simulate-client"
              onClick={() => {
                handleSimulateClient();
                if (isActive && currentStep === 3) goNext();
              }}
              disabled={demoEngine.state === 'idle'}
              className="w-full justify-start"
              variant={demoEngine.state !== 'idle' ? 'primary' : 'outline'}
            >
              <Smartphone size={18} className="mr-2" />
              2. Simular Cliente
            </Button>
            
            <Button 
              onClick={() => {
                demoEngine.resetDemo();
                resetStoreDemo();
                resetCoreDemo();
                resetGuidedDemo();
              }}
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              variant="outline"
            >
              <RefreshCw size={18} className="mr-2" />
              Reiniciar Demo
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
