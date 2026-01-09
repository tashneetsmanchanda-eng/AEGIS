import { useEffect } from 'react';
import { motion } from 'motion/react';

interface RespiratoryTransitionProps {
  onComplete: () => void;
}

export function RespiratoryTransition({ onComplete }: RespiratoryTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Remove Air (Starts First) */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          opacity: 1,
          backdropFilter: 'brightness(1)',
        }}
        animate={{ 
          opacity: 0.7,
          backdropFilter: 'brightness(0.6)',
        }}
        transition={{ duration: 2.5, delay: 0.1 }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}
      />

      {/* Midground Layer - Collapse Negative Space (Starts Second) */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          scale: 1,
          opacity: 0,
        }}
        animate={{ 
          scale: 0.95, // Subtle inward pull
          opacity: 0.4,
        }}
        transition={{ duration: 2.2, delay: 0.3 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(255, 255, 255, 0.1) 100%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Foreground Layer - Breathing Becomes Effort (Starts Last) */}
      <motion.div
        className="absolute inset-0"
        animate={{ 
          opacity: [0.2, 0.5, 0.3],
          scale: [0.98, 1.02, 0.99],
        }}
        transition={{ 
          duration: 2.5,
          delay: 0.5,
          repeat: 1,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.15), transparent)',
          filter: 'blur(100px)',
        }}
      />

      {/* Subtle Inward Pull - Breathing Strain */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          transform: 'scale(1)',
          filter: 'blur(0px)',
        }}
        animate={{ 
          transform: 'scale(0.97)',
          filter: 'blur(12px)',
        }}
        transition={{ duration: 2.5, delay: 0.8 }}
      />

      {/* Visibility Drops - Atmospheric Perspective */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />

      {/* Fade to Black */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.5 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
