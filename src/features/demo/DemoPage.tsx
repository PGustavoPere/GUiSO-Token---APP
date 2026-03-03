import React from 'react';
import { motion } from 'motion/react';
import { Play, ShieldCheck, Heart, FileText } from 'lucide-react';
import { useDemoStore } from './DemoStore';
import { useGuidedDemo } from '../demoGuided/useGuidedDemo';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';

import { useGuisoCore } from '../../core/GuisoCoreStore';

export default function DemoPage() {
  const { isDemoMode, startDemo, resetDemo } = useDemoStore();
  const { startGuidedDemo, resetGuidedDemo } = useGuidedDemo();
  const { resetDemo: resetCoreDemo } = useGuisoCore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play size={40} className="ml-2" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Modo Demo Interactivo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Este modo permite demostrar cómo GUISO genera impacto real mediante pagos verificados, sin necesidad de usar fondos reales.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 bg-white border border-gray-100 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-guiso-orange mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">1. Pago Seguro</h3>
            <p className="text-sm text-gray-600">Simula un pago con QR en un comercio adherido.</p>
          </Card>
          
          <Card className="text-center p-6 bg-white border border-gray-100 shadow-sm">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">2. Impacto Real</h3>
            <p className="text-sm text-gray-600">Observa cómo el pago genera impacto automático.</p>
          </Card>
          
          <Card className="text-center p-6 bg-white border border-gray-100 shadow-sm">
            <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">3. Certificado</h3>
            <p className="text-sm text-gray-600">Obtén un certificado inmutable en la blockchain.</p>
          </Card>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isDemoMode ? 'Demo Activa' : '¿Listo para empezar?'}
          </h2>
          
          {isDemoMode ? (
            <div className="space-y-4">
              <p className="text-green-600 font-medium mb-6">
                El modo demo está activo. Usa el panel flotante para controlar la simulación.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/merchant')} className="px-8 py-4 text-lg">
                  Ir al Comercio Demo
                </Button>
                <Button onClick={() => {
                  resetDemo();
                  resetCoreDemo();
                  resetGuidedDemo();
                }} variant="outline" className="px-8 py-4 text-lg text-red-600 border-red-200 hover:bg-red-50">
                  Detener Demo
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => {
                startDemo();
                startGuidedDemo();
                navigate('/merchant');
              }} 
              className="px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Play className="mr-2 fill-current" />
              Iniciar Simulación
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
