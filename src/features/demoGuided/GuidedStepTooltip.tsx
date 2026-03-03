import React from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../components/ui';

interface GuidedStepTooltipProps {
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  step: number;
  totalSteps: number;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
}

export const GuidedStepTooltip: React.FC<GuidedStepTooltipProps> = ({
  title,
  description,
  position = 'center',
  step,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  nextLabel = 'Siguiente'
}) => {
  let positionClasses = '';
  switch (position) {
    case 'top': positionClasses = 'bottom-full mb-4 left-1/2 -translate-x-1/2'; break;
    case 'bottom': positionClasses = 'top-full mt-4 left-1/2 -translate-x-1/2'; break;
    case 'left': positionClasses = 'right-full mr-4 top-1/2 -translate-y-1/2'; break;
    case 'right': positionClasses = 'left-full ml-4 top-1/2 -translate-y-1/2'; break;
    case 'center': positionClasses = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'; break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`absolute w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-[110] pointer-events-auto ${positionClasses}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-900">{title}</h4>
        {onSkip && (
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">
          Paso {step} de {totalSteps}
        </span>
        <div className="flex gap-2">
          {onPrev && step > 1 && (
            <Button variant="outline" size="sm" onClick={onPrev} className="px-2">
              <ChevronLeft size={16} />
            </Button>
          )}
          {onNext && (
            <Button size="sm" onClick={onNext} className="px-3">
              {nextLabel} {nextLabel === 'Siguiente' && <ChevronRight size={16} className="ml-1" />}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
