import { useEffect } from 'react';
import { motion } from 'motion/react';

interface RespiratoryTransitionProps {
  onComplete: () => void;
}

export function RespiratoryTransition({ onComplete }: RespiratoryTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 750); // 750ms for premium animation

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      {/* Central Pulse Wave - Expanding Radial */}
      <motion.div
        className="absolute"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 100%)',
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 4, 5],
          opacity: [0, 0.6, 0],
        }}
        transition={{ 
          duration: 0.75,
          ease: [0.25, 0.1, 0.25, 1], // Smooth cinematic easing
        }}
      />

      {/* Secondary Wave - Slightly Delayed */}
      <motion.div
        className="absolute"
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 100%)',
        }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ 
          scale: [0.6, 4.5, 5.5],
          opacity: [0, 0.4, 0],
        }}
        transition={{ 
          duration: 0.75,
          delay: 0.1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />

      {/* Breath-like Expansion - Systemic Spread */}
      <motion.div
        className="absolute"
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ 
          scale: [1, 3.5, 4],
          opacity: [0.8, 0.3, 0],
        }}
        transition={{ 
          duration: 0.75,
          delay: 0.15,
          ease: [0.2, 0, 0.2, 1],
        }}
      />

      {/* Fade to Black */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.55 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
