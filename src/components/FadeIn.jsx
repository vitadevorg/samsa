import React from 'react';
import { useInView } from '../hooks/useInView';

// Las clases de duración/desplazamiento se pasan completas para que Tailwind las detecte.
const FadeIn = ({
  children,
  delay = 0,
  className = '',
  once = true,
  duration = 'duration-700',
  offset = 'translate-y-8',
}) => {
  const [ref, isVisible] = useInView({ once });
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all ${duration} ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : `opacity-0 ${offset}`
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeIn;
