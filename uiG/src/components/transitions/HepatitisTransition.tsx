import { useEffect } from 'react';
import { motion } from 'motion/react';

interface HepatitisTransitionProps {
  onComplete: () => void;
}

export function HepatitisTransition({ onComplete }: HepatitisTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Slow Amber Currents (Starts First) */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          background: 'linear-gradient(180deg, transparent 0%, rgba(217, 119, 6, 0.1) 50%, transparent 100%)',
          y: '-100%',
        }}
        animate={{ 
          y: '100%',
        }}
        transition={{ duration: 2.5, delay: 0.2, ease: 'easeInOut' }}
        style={{
          filter: 'blur(40px)',
        }}
      />

      {/* Midground Layer - Rhythmic Pulses (Starts Second) */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: '400px',
          height: '400px',
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.3), transparent)',
          filter: 'blur(50px)',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.3, 1, 1.2, 1],
          opacity: [0, 0.4, 0.2, 0.35, 0.15],
        }}
        transition={{ 
          duration: 2.5,
          delay: 0.4,
          times: [0, 0.3, 0.5, 0.7, 1], // Rhythmic pulses
        }}
      />

      {/* Foreground Layer - Delayed Reaction Chains (Starts Last) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: '0px',
            height: '0px',
            x: '-50%',
            y: '-50%',
            borderColor: `rgba(217, 119, 6, ${0.3 - i * 0.04})`,
            borderWidth: '1px',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 3 - i * 0.4,
            opacity: [0, 0.3, 0],
          }}
          transition={{ 
            duration: 2,
            delay: 0.6 + i * 0.2, // Delayed reaction chain
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Metabolic Flow - Damage Accumulating */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.25, 0.15] }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(217, 119, 6, 0.15), transparent)',
          filter: 'blur(60px)',
        }}
      />

      {/* Light Falloff - Internal Time */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />

      {/* Fade Out */}
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
