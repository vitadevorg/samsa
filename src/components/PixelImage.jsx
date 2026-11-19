import React, { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const DEFAULT_GRIDS = {
  '6x4': { rows: 4, cols: 6 },
  '8x8': { rows: 8, cols: 8 },
  '8x3': { rows: 3, cols: 8 },
  '4x6': { rows: 6, cols: 4 },
  '3x8': { rows: 8, cols: 3 },
};

/**
 * Magic UI-style PixelImage reveal: reveals an image through staggered pixel grid tiles.
 */
const PixelImage = ({
  src,
  alt,
  grid = '6x4',
  grayscaleAnimation = true,
  pixelFadeInDuration = 1000,
  maxAnimationDelay = 1200,
  colorRevealDelay = 1300,
  className = '',
  imgClassName = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(Boolean(shouldReduceMotion));
  const [showColor, setShowColor] = useState(Boolean(shouldReduceMotion));

  const { rows, cols } = DEFAULT_GRIDS[grid] || DEFAULT_GRIDS['6x4'];

  useEffect(() => {
    if (shouldReduceMotion) return;
    const startTimer = setTimeout(() => setIsVisible(true), 60);
    const colorTimer = setTimeout(() => setShowColor(true), colorRevealDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(colorTimer);
    };
  }, [shouldReduceMotion, colorRevealDelay]);

  const pieces = useMemo(() => {
    const total = rows * cols;
    return Array.from({ length: total }, (_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const top = (row * 100) / rows;
      const bottom = 100 - ((row + 1) * 100) / rows;
      const left = (col * 100) / cols;
      const right = 100 - ((col + 1) * 100) / cols;
      // Deterministic pseudo-random delay based on tile index
      const pseudoRandom = ((index * 37 + row * 17 + col * 23) % 100) / 100;
      const delay = Math.round(pseudoRandom * maxAnimationDelay);

      return {
        clipPath: `inset(${top.toFixed(2)}% ${right.toFixed(2)}% ${bottom.toFixed(2)}% ${left.toFixed(2)}%)`,
        delay,
      };
    });
  }, [rows, cols, maxAnimationDelay]);

  if (shouldReduceMotion) {
    return (
      <div className={`relative overflow-hidden select-none ${className}`}>
        <img src={src} alt={alt} className={`w-full h-full object-cover ${imgClassName}`} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden select-none ${className}`}>
      {pieces.map((piece, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity ease-out"
          style={{
            clipPath: piece.clipPath,
            opacity: isVisible ? 1 : 0,
            transitionDuration: `${pixelFadeInDuration}ms`,
            transitionDelay: `${piece.delay}ms`,
          }}
        >
          <img
            src={src}
            alt={index === 0 ? alt : ''}
            aria-hidden={index === 0 ? undefined : true}
            draggable={false}
            className={`w-full h-full object-cover transition-all ease-out ${imgClassName} ${
              grayscaleAnimation ? (showColor ? 'grayscale-0' : 'grayscale') : ''
            }`}
            style={{
              transitionDuration: `${pixelFadeInDuration}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PixelImage;
