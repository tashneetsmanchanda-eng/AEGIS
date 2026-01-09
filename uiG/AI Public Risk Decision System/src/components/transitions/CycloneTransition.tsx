import { useEffect } from 'react';
import { motion } from 'motion/react';

interface CycloneTransitionProps {
  onComplete: () => void;
}

export function CycloneTransition({ onComplete }: CycloneTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Pressure Gradients (Starts First) */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: '800px',
          height: '800px',
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, transparent 0%, rgba(139, 92, 246, 0.15) 50%, rgba(139, 92, 246, 0.3) 100%)',
        }}
        initial={{ rotate: 0, scale: 0.6, opacity: 0 }}
        animate={{ 
          rotate: 180,
          scale: 1.1,
          opacity: [0, 0.4, 0.3],
        }}
        transition={{ duration: 2.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Midground Layer - Circular Air Density Bands (Starts Second) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full border"
          style={{
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            x: '-50%',
            y: '-50%',
            borderColor: `rgba(139, 92, 246, ${0.2 - i * 0.02})`,
            borderWidth: '1px',
          }}
          initial={{ rotate: 0, opacity: 0 }}
          animate={{ 
            rotate: (i % 2 === 0 ? 1 : -1) * 360,
            opacity: [0, 0.3, 0.15],
          }}
          transition={{ 
            duration: 2.5,
            delay: 0.3 + i * 0.1,
            ease: [0.4, 0, 0.6, 1], // Non-linear: slow → faster → slow
          }}
        />
      ))}

      {/* Foreground Layer - Radial Wind Lines (Starts Last) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 origin-left h-0.5"
          style={{
            width: '350px',
            transform: `rotate(${i * 30}deg)`,
            background: 'linear-gradient(to right, rgba(139, 92, 246, 0.5), transparent)',
          }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ 
            opacity: [0, 0.4, 0],
            scaleX: [0, 1, 1.2],
            rotate: `${i * 30 - 270}deg`,
          }}
          transition={{ 
            duration: 2,
            delay: 0.5 + i * 0.04,
            ease: [0.4, 0, 0.6, 1], // Breathing motion
          }}
        />
      ))}

      {/* Lens Distortion - Subtle */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          backdropFilter: 'blur(0px)',
          transform: 'scale(1)',
        }}
        animate={{ 
          backdropFilter: 'blur(4px)',
          transform: 'scale(1.02)',
        }}
        transition={{ duration: 2, delay: 0.8 }}
      />

      {/* Atmospheric Torque - Non-linear Rotation Speed */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          width: '600px',
          height: '600px',
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, transparent 0%, rgba(139, 92, 246, 0.2) 100%)',
        }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 540 }}
        transition={{ 
          duration: 2.5,
          ease: [0.25, 0.1, 0.25, 1], // Slow → slightly faster → slow again
        }}
      />

      {/* Light Falloff - Edges Darken */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />

      {/* Center Collapse - Breathing Storm */}
      <motion.div
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: '0px',
          height: '0px',
          x: '-50%',
          y: '-50%',
          backgroundColor: '#000000',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 25 }}
        transition={{ duration: 0.7, delay: 2.3, ease: 'easeIn' }}
      />

      {/* Fade to Black */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 2.7 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
