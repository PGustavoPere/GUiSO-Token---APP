import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useGuidedDemo } from './useGuidedDemo';
import { GuidedStepTooltip } from './GuidedStepTooltip';
import { useDemoStore } from '../demo/DemoStore';
import { impactCertificateService } from '../impactCertificate/impactCertificateService';

export const GuidedDemoOverlay: React.FC = () => {
  const { isActive, currentStep, goNext, goBack, finishDemo, closeOverlay } = useGuidedDemo();
  const { session } = useDemoStore();
  const navigate = useNavigate();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        finishDemo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, finishDemo]);

  // Step 4: Wait for certificate creation
  useEffect(() => {
    if (isActive && currentStep === 4) {
      const checkCertificate = () => {
        const certs = impactCertificateService.getDemoCertificates();
        if (certs.length > 0) {
          goNext();
        }
      };
      const interval = setInterval(checkCertificate, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, currentStep, goNext]);

  // Step 5: Navigate to Impact Explorer
  useEffect(() => {
    if (isActive && currentStep === 5) {
      navigate('/impact-explorer');
      // Auto advance to step 6 after navigation
      const timeout = setTimeout(() => {
        goNext();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, currentStep, navigate, goNext]);

  // Find target elements for highlighting
  useEffect(() => {
    if (!isActive) return;

    const updateTarget = () => {
      let selector = '';
      if (currentStep === 2) selector = '[data-demo-target="create-payment"]';
      if (currentStep === 3) selector = '[data-demo-target="simulate-client"]';

      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          setTargetRect(el.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    updateTarget();
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    
    // Mutation observer to catch dynamically rendered elements
    const observer = new MutationObserver(updateTarget);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateTarget);
      window.removeEventListener('scroll', updateTarget, true);
      observer.disconnect();
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const stepsConfig = [
    {
      step: 1,
      title: "Bienvenido a la simulación",
      description: "Bienvenido a la simulación interactiva de impacto GUISO. Aquí verás cómo funciona el ecosistema sin usar fondos reales.",
      position: "center" as const,
    },
    {
      step: 2,
      title: "Crear un Pago",
      description: "Como comercio, primero debes generar una solicitud de pago (QR) para que el cliente pueda escanearla. Haz clic en el botón resaltado.",
      position: "left" as const,
    },
    {
      step: 3,
      title: "Simular Cliente",
      description: "Ahora, simula ser el cliente que escanea el QR y realiza el pago con tokens GSO. Haz clic en el botón resaltado.",
      position: "left" as const,
    },
    {
      step: 4,
      title: "Generando Impacto...",
      description: "Espera mientras se procesa el pago y se genera el certificado de impacto en la blockchain. Esto avanzará automáticamente.",
      position: "center" as const,
    },
    {
      step: 5,
      title: "Explorador de Impacto",
      description: "Redirigiendo al explorador para ver el certificado...",
      position: "center" as const,
    },
    {
      step: 6,
      title: "Impacto Verificable",
      description: "Cada acción genera impacto verificable. ¡Has completado la demo!",
      position: "center" as const,
      nextLabel: "Explorar GUISO"
    }
  ];

  const currentConfig = stepsConfig.find(s => s.step === currentStep);
  if (!currentConfig) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] pointer-events-none"
      >
        <div className="absolute inset-0 overflow-y-auto scrollbar-thin overflow-x-hidden touch-pan-y pointer-events-none">
          {/* Darkened background */}
          {!targetRect && (
            <div className={`absolute inset-0 bg-black/40 ${currentStep === 4 ? 'pointer-events-none' : 'pointer-events-auto'}`} />
          )}

          {/* Highlight cutout */}
          {targetRect && (
            <motion.div
              className="absolute bg-transparent border-2 border-guiso-orange rounded-xl pointer-events-none transition-all duration-300 z-[105]"
              animate={{
                top: targetRect.top - 8,
                left: targetRect.left - 8,
                width: targetRect.width + 16,
                height: targetRect.height + 16,
              }}
              style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}
            />
          )}

          {/* Tooltip positioning wrapper */}
          <div 
            className="absolute pointer-events-none transition-all duration-300 z-[110]"
            style={targetRect && currentConfig.position !== 'center' ? {
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            } : {
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
            }}
          >
            <GuidedStepTooltip
              title={currentConfig.title}
              description={currentConfig.description}
              position={currentConfig.position}
              step={currentStep}
              totalSteps={6}
              onNext={currentStep === 4 || currentStep === 5 ? undefined : (currentStep === 6 ? finishDemo : goNext)}
              onPrev={currentStep > 1 && currentStep !== 4 && currentStep !== 5 ? goBack : undefined}
              onSkip={closeOverlay}
              nextLabel={currentConfig.nextLabel}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
