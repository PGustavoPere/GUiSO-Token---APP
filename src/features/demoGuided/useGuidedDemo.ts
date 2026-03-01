import { useGuidedDemoStore } from './GuidedDemoStore';

export const useGuidedDemo = () => {
  const { active, step, lockNavigation, nextStep, previousStep, finishDemo, closeOverlay, resetGuidedDemo, startGuidedDemo } = useGuidedDemoStore();

  return {
    isActive: active,
    currentStep: step,
    lockNavigation,
    goNext: nextStep,
    goBack: previousStep,
    finishDemo,
    closeOverlay,
    resetGuidedDemo,
    startGuidedDemo
  };
};
