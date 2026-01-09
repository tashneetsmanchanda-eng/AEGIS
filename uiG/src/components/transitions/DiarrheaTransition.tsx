import { useEffect } from 'react';
import { motion } from 'motion/react';

interface DiarrheaTransitionProps {
  onComplete: () => void;
}

export function DiarrheaTransition({ onComplete }: DiarrheaTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Abstract Channels (Starts First) */}
      <svg className="absolute inset-0 w-full h-full opacity-15">
        {[...Array(8)].map((_, i) => (
          <motion.path
            key={i}
            d={`M ${100 + i * 120} 0 Q ${150 + i * 120} ${window.innerHeight / 2} ${100 + i * 120} ${window.innerHeight}`}
            stroke="rgba(217, 119, 6, 0.2)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1,
              opacity: [0, 0.3, 0.15],
            }}
            transition={{ 
              duration: 1.8,
              delay: 0.2 + i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>

      {/* Midground Layer - Liquid Obeys Constraints (Starts Second) */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0"
          style={{
            width: '100%',
            height: '25px',
            top: `${150 + i * 140}px`,
            background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), transparent)',
            filter: 'blur(8px)',
          }}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ 
            x: '100%',
            opacity: [0, 0.4, 0],
          }}
          transition={{ 
            duration: 1.5,
            delay: 0.4 + i * 0.25,
            ease: [0.4, 0, 0.2, 1], // Constrained flow
          }}
        />
      ))}

      {/* Foreground Layer - Amber Contamination Creeps (Starts Last) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ 
          height: '0%',
          opacity: 0,
        }}
        animate={{ 
          height: '50%',
          opacity: 0.25,
        }}
        transition={{ 
          duration: 2,
          delay: 0.6,
          ease: [0.25, 0.1, 0.25, 1], // Creeps, not floods
        }}
        style={{
          background: 'linear-gradient(to top, rgba(217, 119, 6, 0.3), transparent)',
          filter: 'blur(15px)',
        }}
      />

      {/* Systemic Flow - System Failing Quietly */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          backgroundColor: 'transparent',
          backdropFilter: 'blur(0px)',
        }}
        animate={{ 
          backgroundColor: 'rgba(217, 119, 6, 0.08)',
          backdropFilter: 'blur(4px)',
        }}
        transition={{ duration: 1.8, delay: 0.8 }}
      />

      {/* Light Falloff */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 1 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />

      {/* Fade Out */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.1 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
