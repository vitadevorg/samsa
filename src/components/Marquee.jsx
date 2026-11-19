import React from 'react';

/**
 * Magic UI-style infinite scrolling Marquee supporting horizontal and vertical layouts.
 */
const Marquee = ({
  className = '',
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) => {
  return (
    <div
      {...props}
      className={`group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)] ${
        vertical ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap))); }
        }
        @keyframes marquee-vertical {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-100% - var(--gap))); }
        }
        .animate-marquee {
          animation: marquee var(--duration) linear infinite;
        }
        .animate-marquee-vertical {
          animation: marquee-vertical var(--duration) linear infinite;
        }
      `}</style>
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={`flex shrink-0 justify-around [gap:var(--gap)] ${
            vertical ? 'animate-marquee-vertical flex-col' : 'animate-marquee flex-row'
          } ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''} ${
            reverse ? '[animation-direction:reverse]' : ''
          }`}
        >
          {children}
        </div>
      ))}
    </div>
  );
};

export default Marquee;
