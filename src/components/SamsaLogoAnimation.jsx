import React, { useEffect, useId, useState } from 'react';
import { motion as Motion, useReducedMotion } from 'motion/react';

/**
 * Animated brand formation sequence for SAMSA:
 * 1. Three organic light-blue blobs (cross, pulse, stethoscope) appear.
 * 2. Blobs converge toward the center into a unified aura.
 * 3. The official SAMSA SVG symbol (upper/lower S-bands + medical cross) forms.
 * 4. The symbol settles left as the SAMSA wordmark reveals.
 * 5. Smooth transition into the application.
 */
const SamsaLogoAnimation = ({
  autoPlay = true,
  onComplete,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = `samsa-anim-${useId().replace(/:/g, '')}`;
  const [phase, setPhase] = useState(shouldReduceMotion ? 'settle' : 'blobs');
  const [spreadX, setSpreadX] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 240 : 115
  );

  useEffect(() => {
    const onResize = () => setSpreadX(window.innerWidth >= 768 ? 240 : 115);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    if (shouldReduceMotion) {
      const doneTimer = setTimeout(() => onComplete?.(), 500);
      return () => clearTimeout(doneTimer);
    }

    const t1 = setTimeout(() => setPhase('converge'), 650);
    const t2 = setTimeout(() => setPhase('form'), 1250);
    const t3 = setTimeout(() => setPhase('settle'), 2150);
    const t4 = setTimeout(() => setPhase('exit'), 3050);
    const t5 = setTimeout(() => onComplete?.(), 3550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [autoPlay, shouldReduceMotion, onComplete]);

  const isConverged = phase === 'converge' || phase === 'form' || phase === 'settle' || phase === 'exit';
  const isForming = phase === 'form' || phase === 'settle' || phase === 'exit';
  const isSettled = phase === 'settle' || phase === 'exit';
  const isExiting = phase === 'exit';

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white overflow-hidden select-none ${className}`}
      style={{
        height: '100svh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Subtle blue transition wave on exit */}
      <Motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0.12 : 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
      />

      {/* Skip button */}
      <button
        type="button"
        onClick={() => onComplete?.()}
        className="absolute top-5 right-5 z-20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        Omitir
      </button>

      {/* Main composition */}
      <Motion.div
        className="relative flex flex-col items-center justify-center w-[min(94vw,64rem)] max-w-[calc(100%-1.5rem)]"
        animate={{ opacity: isExiting ? 0 : 1, scale: isExiting ? 0.98 : 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Phase 1 & 2: Three organic medical blobs converging */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 flex items-center justify-center">
          {/* Left Blob: Medical Cross */}
          <Motion.div
            aria-hidden="true"
            className="absolute flex items-center justify-center w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-[44%_56%_52%_48%/48%_44%_56%_52%] bg-sky-100/90 shadow-sm"
            initial={{ opacity: 0, x: -spreadX, scale: 0.68, rotate: -10 }}
            animate={{
              opacity: isForming ? 0 : 1,
              x: isConverged ? 0 : -spreadX,
              scale: isConverged ? 1.15 : 1,
              rotate: isConverged ? 0 : -4,
            }}
            transition={{ type: 'spring', stiffness: 82, damping: 17, mass: 0.9 }}
          >
            <svg className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Motion.div>

          {/* Center Blob: Heartbeat Pulse */}
          <Motion.div
            aria-hidden="true"
            className="absolute flex items-center justify-center w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-[52%_48%_44%_56%/56%_52%_48%_44%] bg-sky-100/90 shadow-sm"
            initial={{ opacity: 0, scale: 0.68 }}
            animate={{
              opacity: isSettled ? 0 : isForming ? 0.85 : 1,
              scale: isForming ? 1.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 82, damping: 17, mass: 0.9 }}
          >
            <Motion.svg
              className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ opacity: isForming ? 0 : 1 }}
              transition={{ duration: 0.25 }}
            >
              <Motion.path
                d="M3 12h4l2.5-6 4 12 2.5-6H21"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </Motion.svg>
          </Motion.div>

          {/* Right Blob: Stethoscope */}
          <Motion.div
            aria-hidden="true"
            className="absolute flex items-center justify-center w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-[48%_52%_56%_44%/44%_56%_44%_56%] bg-sky-100/90 shadow-sm"
            initial={{ opacity: 0, x: spreadX, scale: 0.68, rotate: 10 }}
            animate={{
              opacity: isForming ? 0 : 1,
              x: isConverged ? 0 : spreadX,
              scale: isConverged ? 1.15 : 1,
              rotate: isConverged ? 0 : 4,
            }}
            transition={{ type: 'spring', stiffness: 82, damping: 17, mass: 0.9 }}
          >
            <svg className="w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v5a6 6 0 0 0 12 0V4" />
              <path d="M12 15v2a4 4 0 0 0 8 0v-2" />
              <circle cx="20" cy="13" r="2" />
            </svg>
          </Motion.div>

          {/* Phase 3 & 4: Official SAMSA Logo + Wordmark */}
          <Motion.div
            className="relative z-10 flex items-center justify-center gap-4 sm:gap-7"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: isForming ? 1 : 0,
              scale: isSettled ? 1 : isForming ? 1.05 : 0.9,
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="23 4 128 103"
              preserveAspectRatio="xMidYMid meet"
              className="h-24 sm:h-36 md:h-48 w-auto shrink-0"
              role="img"
              aria-label="SAMSA"
            >
              <defs>
                <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="25" y1="7" x2="149" y2="106">
                  <stop offset="0" stopColor="#2563EB" />
                  <stop offset=".58" stopColor="#1D4ED8" />
                  <stop offset="1" stopColor="#4338CA" />
                </linearGradient>
              </defs>
              {/* Top S-band */}
              <Motion.path
                fill={`url(#${gradientId})`}
                d="M148 7H89C63 7 42 20 37 40c-5 17 6 30 24 30h12c-9-5-14-12-14-20 0-12 10-22 24-22h45c2 0 4-1 5-3Z"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: isForming ? 1 : 0, x: isForming ? 0 : -18 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Bottom S-band */}
              <Motion.path
                fill={`url(#${gradientId})`}
                d="M102 38h9c22 0 37 15 33 34-4 20-25 32-49 32H26l15-18c2-3 5-4 8-4h44c14 0 24-10 24-22 0-9-6-17-15-22Z"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: isForming ? 1 : 0, x: isForming ? 0 : 18 }}
                transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Center Medical Cross */}
              <Motion.path
                fill={`url(#${gradientId})`}
                d="M86 39h7a3 3 0 0 1 3 3v7h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-8v7a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-7h-8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3h8v-7a3 3 0 0 1 3-3Z"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: isForming ? 1 : 0, scale: isForming ? 1 : 0.6 }}
                transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: '89.5px 54.5px' }}
              />
            </svg>

            <Motion.span
              className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-slate-900"
              initial={{ opacity: 0, x: -12, width: 0 }}
              animate={{
                opacity: isSettled ? 1 : 0,
                x: isSettled ? 0 : -12,
                width: isSettled ? 'auto' : 0,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              SAMSA
            </Motion.span>
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
};

export default SamsaLogoAnimation;
