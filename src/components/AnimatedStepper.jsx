import React from 'react';
import { AnimatePresence, motion as Motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

/**
 * SmoothUI-style Animated Stepper with step indicator bar and directional slide transitions.
 */
const AnimatedStepper = ({
  steps = [],
  currentStep = 1,
  direction = 1,
  children,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full">
      {/* Stepper Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between relative">
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;

            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center relative z-10 flex-1">
                  <Motion.div
                    initial={false}
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      backgroundColor: isCompleted
                        ? '#2563eb'
                        : isActive
                        ? '#1d4ed8'
                        : '#0f172a',
                      borderColor: isCompleted || isActive ? '#3b82f6' : '#334155',
                    }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                  </Motion.div>
                  <span
                    className={`mt-1.5 text-[11px] font-semibold text-center leading-tight hidden sm:block ${
                      isActive ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-800 -mx-4 sm:-mx-6 mb-0 sm:mb-5 relative overflow-hidden rounded-full">
                    <Motion.div
                      className="h-full bg-blue-500 origin-left"
                      initial={false}
                      animate={{ scaleX: stepNum < currentStep ? 1 : 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: 'easeOut' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Animated Step Content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <Motion.div
            key={currentStep}
            custom={direction}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, x: direction >= 0 ? 28 : -28 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, x: direction >= 0 ? -28 : 28 }
            }
            transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
          >
            {children}
          </Motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AnimatedStepper;
