import { useEffect } from 'react';
import { motion } from 'motion/react';

interface FloodTransitionProps {
  onComplete: () => void;
}

export function FloodTransition({ onComplete }: FloodTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - City Lights (Starts First) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.15, 0.1] }}
        transition={{ duration: 2, delay: 0.2 }}
        style={{
          height: '40%',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.08), transparent)',
          filter: 'blur(60px)',
        }}
      />

      {/* Midground Layer - Subsurface Shadows (Starts Second) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: '0%', opacity: 0 }}
        animate={{ height: '60%', opacity: 0.3 }}
        transition={{ duration: 2.2, delay: 0.4, ease: 'easeIn' }}
        style={{
          background: 'linear-gradient(to top, rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.2))',
          filter: 'blur(40px)',
        }}
      />

      {/* Foreground Layer - Water Surface (Starts Last) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: '0%', opacity: 0 }}
        animate={{ height: '100%', opacity: 0.5 }}
        transition={{ duration: 2.5, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: 'linear-gradient(to top, rgba(30, 58, 138, 0.6), rgba(59, 130, 246, 0.3))',
        }}
      />

      {/* Reflection Bends Light - Subtle Distortion */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0, scaleY: 1 }}
        animate={{ 
          opacity: [0, 0.2, 0.15],
          scaleY: [1, 0.98, 0.99],
        }}
        transition={{ duration: 2, delay: 1 }}
        style={{
          height: '30%',
          background: 'linear-gradient(to top, rgba(147, 197, 253, 0.15), transparent)',
          backdropFilter: 'blur(3px)',
          transform: 'skewY(-0.5deg)',
        }}
      />

      {/* Micro Ripples - Propagate Outward */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 bottom-0 rounded-full border border-blue-400/20"
          style={{
            x: '-50%',
            width: '0px',
            height: '0px',
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            opacity: [0, 0.3, 0],
            y: `${-50 - i * 30}px`,
          }}
          transition={{ 
            duration: 1.5,
            delay: 1.2 + i * 0.15,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Pressure Vignette - Edges Darken Slowly */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2.5, delay: 1 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
        }}

      />

      {/* Light Falloff - Atmospheric Perspective */}
      <motion.div
        className="absolute inset-0"
        initial={{ backdropFilter: 'blur(0px) brightness(1)' }}
        animate={{ 
          backdropFilter: 'blur(6px) brightness(0.85)',
        }}
        transition={{ duration: 2.5, delay: 0.8 }}
      />

      {/* Subtle Lightning - Very Faint */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0, 0.08, 0],
        }}
        transition={{ 
          duration: 0.2,
          delay: 2.5,
          times: [0, 0.5, 1],
        }}
        style={{
          backgroundColor: 'rgba(147, 197, 253, 0.08)',
        }}
      />

      {/* Fade to Black - Silent Weight */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.0 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}

