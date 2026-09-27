import React from 'react';
import { useInView } from '../hooks/useInView';

const Reveal = ({ children, delay = 0, className = '', scale = false }) => {
  const [ref, isVisible] = useInView({ rootMargin: '0px 0px -50px 0px' });
  const hiddenTransform = scale ? 'translateY(30px) scale(0.98)' : 'translateY(30px)';
  const visibleTransform = scale ? 'translateY(0) scale(1)' : 'translateY(0)';
  const style = {
    transition: `all 1s cubic-bezier(0.215, 0.610, 0.355, 1.000) ${delay}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? visibleTransform : hiddenTransform,
  };
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
