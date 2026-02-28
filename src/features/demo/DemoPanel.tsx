import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RefreshCw, Smartphone, QrCode, X } from 'lucide-react';
import { useDemoStore } from './DemoStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

export default function DemoPanel() {
  const { isDemoMode, session, startDemo, resetDemo, createDemoPayment } = useDemoStore();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

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
          <button onClick={resetDemo} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Comercio:</strong> Comedor Esperanza</p>
            <p><strong>Estado:</strong> {session?.demoPaymentId ? 'Pago Creado' : 'Esperando...'}</p>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => {
                const id = createDemoPayment();
                if (id) navigate(`/merchant`);
              }}
              className="w-full justify-start"
              variant={session?.demoPaymentId ? 'outline' : 'primary'}
            >
              <QrCode size={18} className="mr-2" />
              1. Crear Pago Demo
            </Button>
            
            <Button 
              onClick={handleSimulateClient}
              disabled={!session?.demoPaymentId}
              className="w-full justify-start"
              variant={session?.demoPaymentId ? 'primary' : 'outline'}
            >
              <Smartphone size={18} className="mr-2" />
              2. Simular Cliente
            </Button>
            
            <Button 
              onClick={resetDemo}
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
