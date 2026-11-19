import React from 'react';
import { motion as Motion, useReducedMotion } from 'motion/react';

/**
 * Magic UI-style BorderBeam: animated light beam traveling along the border of a relative overflow-hidden container.
 */
const BorderBeam = ({
  size = 56,
  duration = 5,
  delay = 0,
  colorFrom = '#60a5fa',
  colorTo = '#4f46e5',
  borderWidth = 2,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        padding: `${borderWidth}px`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
    >
      <Motion.div
        className={`absolute aspect-square ${className}`}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
        }}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: '100%' }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
          delay,
        }}
      />
    </div>
  );
};

export default BorderBeam;
