import React, { useRef, useState, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'motion/react';

const MASK_TRANSFORMS = {
  wipe: (p) => `inset(0 ${(1 - p) * 100}% 0 0)`,
  curtain: (p) => {
    const edge = ((1 - p) * 50).toFixed(2);
    return `inset(0 ${edge}% 0 ${edge}%)`;
  },
  circle: (p) => `circle(${(p * 75).toFixed(2)}% at 50% 50%)`,
  blinds: (p) => {
    const pct = (p * 100).toFixed(2);
    return `linear-gradient(to bottom, #000 ${pct}%, transparent ${pct}%)`;
  },
};

/**
 * Scroll-driven image reveal with mask styles (wipe, curtain, circle, blinds, scale)
 * and counter-parallax travel, respecting prefers-reduced-motion.
 */
const ScrollImageReveal = ({
  src,
  alt,
  mask = 'wipe',
  parallax = 24,
  once = true,
  container,
  className = '',
  imgClassName = '',
}) => {
  const frameRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [hasRevealed, setHasRevealed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    container,
    offset: ['start 95%', 'start 35%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.4,
  });

  useEffect(() => {
    if (!once || shouldReduceMotion) return;
    return smoothProgress.on('change', (v) => {
      if (v >= 0.98) setHasRevealed(true);
    });
  }, [once, shouldReduceMotion, smoothProgress]);

  const effectiveProgress = useTransform(smoothProgress, (v) =>
    hasRevealed ? 1 : v
  );

  const clipPath = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || mask === 'scale' || mask === 'blinds') return undefined;
    const fn = MASK_TRANSFORMS[mask] || MASK_TRANSFORMS.wipe;
    return fn(Math.max(0, Math.min(1, p)));
  });

  const maskImage = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || mask !== 'blinds') return undefined;
    return MASK_TRANSFORMS.blinds(Math.max(0, Math.min(1, p)));
  });

  const frameScale = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || mask !== 'scale') return 1;
    return 1.08 - 0.08 * Math.max(0, Math.min(1, p));
  });

  const yTravel = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || !parallax) return 0;
    return parallax - 2 * parallax * Math.max(0, Math.min(1, p));
  });

  const overscan = shouldReduceMotion ? 0 : Math.abs(parallax);

  return (
    <div ref={frameRef} className={`overflow-hidden relative ${className}`}>
      <motion.div
        className="w-full h-full"
        style={{
          clipPath: mask !== 'scale' && mask !== 'blinds' ? clipPath : undefined,
          WebkitMaskImage: mask === 'blinds' ? maskImage : undefined,
          maskImage: mask === 'blinds' ? maskImage : undefined,
          scale: mask === 'scale' ? frameScale : 1,
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${imgClassName}`}
          style={{
            y: yTravel,
            height: overscan ? `calc(100% + ${overscan * 2}px)` : '100%',
            marginTop: overscan ? `-${overscan}px` : 0,
          }}
        />
      </motion.div>
    </div>
  );
};

export const ScrollMaskReveal = ({
  children,
  mask = 'wipe',
  once = true,
  container,
  className = '',
}) => {
  const frameRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [hasRevealed, setHasRevealed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    container,
    offset: ['start 82%', 'start 22%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 22,
    mass: 0.7,
  });

  useEffect(() => {
    if (!once || shouldReduceMotion) return;
    return smoothProgress.on('change', (v) => {
      if (v >= 0.98) setHasRevealed(true);
    });
  }, [once, shouldReduceMotion, smoothProgress]);

  const effectiveProgress = useTransform(smoothProgress, (v) =>
    hasRevealed ? 1 : v
  );

  const clipPath = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || mask === 'scale' || mask === 'blinds') return undefined;
    const fn = MASK_TRANSFORMS[mask] || MASK_TRANSFORMS.wipe;
    return fn(Math.max(0, Math.min(1, p)));
  });

  const frameScale = useTransform(effectiveProgress, (p) => {
    if (shouldReduceMotion || mask !== 'scale') return 1;
    return 1.06 - 0.06 * Math.max(0, Math.min(1, p));
  });

  return (
    <div ref={frameRef} className={`overflow-hidden ${className}`}>
      <motion.div
        className="w-full h-full"
        style={{
          clipPath: mask !== 'scale' ? clipPath : undefined,
          scale: mask === 'scale' ? frameScale : 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollImageReveal;
