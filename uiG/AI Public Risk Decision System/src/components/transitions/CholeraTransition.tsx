import { useEffect } from 'react';
import { motion } from 'motion/react';

interface CholeraTransitionProps {
  onComplete: () => void;
}

export function CholeraTransition({ onComplete }: CholeraTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Hex-based Diffusion Fields (Starts First) */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {[...Array(12)].map((_, i) => {
          const centerX = (i % 4) * (window.innerWidth / 4) + window.innerWidth / 8;
          const centerY = Math.floor(i / 4) * (window.innerHeight / 3) + window.innerHeight / 6;
          const radius = 80;
          
          return (
            <motion.circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={0}
              fill="rgba(20, 184, 166, 0.2)"
              initial={{ r: 0, opacity: 0 }}
              animate={{ 
                r: radius * 2,
                opacity: [0, 0.3, 0],
              }}
              transition={{ 
                duration: 2,
                delay: 0.2 + i * 0.1,
                ease: 'easeOut',
              }}
            />
          );
        })}
      </svg>

      {/* Midground Layer - Soft Biological Gradients (Starts Second) */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: '0px',
          height: '0px',
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3), transparent)',
          filter: 'blur(50px)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: 3,
          opacity: [0, 0.5, 0.2],
        }}
        transition={{ duration: 2.2, delay: 0.4 }}
      />

      {/* Foreground Layer - Overlapping Probability Zones (Starts Last) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border-2"
          style={{
            width: '0px',
            height: '0px',
            x: '-50%',
            y: '-50%',
            borderColor: `rgba(20, 184, 166, ${0.4 - i * 0.1})`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 4 - i * 0.8,
            opacity: [0, 0.4, 0],
          }}
          transition={{ 
            duration: 2.5,
            delay: 0.6 + i * 0.3,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Epidemiological Geometry - Living Heatmap */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.15] }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(20, 184, 166, 0.15), transparent)',
          filter: 'blur(60px)',
        }}
      />

      {/* Light Falloff - Atmospheric Perspective */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />

      {/* Fade to Black */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.6 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
