import { useEffect } from 'react';
import { motion } from 'motion/react';

interface LeptospirosisTransitionProps {
  onComplete: () => void;
}

export function LeptospirosisTransition({ onComplete }: LeptospirosisTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500); // 3.5 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Background Layer - Rain Streaks (Starts First) */}
      {[...Array(50)].map((_, i) => {
        const x = (i % 20) * (window.innerWidth / 20) + Math.random() * 40;
        const delay = Math.random() * 0.3;
        const duration = 0.9 + Math.random() * 0.3;
        
        return (
          <motion.div
            key={i}
            className="absolute w-0.5 bg-gradient-to-b"
            style={{
              height: '50px',
              left: x,
              top: -50,
              background: 'linear-gradient(to bottom, rgba(99, 102, 241, 0.5), transparent)',
              transform: `rotate(12deg)`,
            }}
            initial={{ y: -50, opacity: 0.7 }}
            animate={{ 
              y: window.innerHeight + 50,
              opacity: [0.7, 0.3, 0],
            }}
            transition={{ 
              duration: duration,
              delay: delay,
              repeat: 1,
              ease: 'linear',
            }}
          />
        );
      })}

      {/* Midground Layer - Ground Ripples (Starts Second) */}
      {[...Array(10)].map((_, i) => {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight - 150 - Math.random() * 200;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full border border-indigo-400/25"
            style={{ left: x, top: y }}
            initial={{ width: 0, height: 0, opacity: 0.5 }}
            animate={{ 
              width: 100,
              height: 100,
              opacity: 0,
            }}
            transition={{ 
              duration: 1.8,
              delay: 0.5 + i * 0.2,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Foreground Layer - Contaminated Splashes (Starts Last) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ 
          height: '0%',
          opacity: 0,
        }}
        animate={{ 
          height: '35%',
          opacity: 0.35,
        }}
        transition={{ 
          duration: 2.2,
          delay: 0.8,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{
          background: 'linear-gradient(to top, rgba(99, 102, 241, 0.25), transparent)',
          filter: 'blur(25px)',
        }}
      />

      {/* Surface Memory - Wet Surfaces Retain History */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0.2] }}
        transition={{ duration: 2, delay: 1.2 }}
        style={{
          height: '30%',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.2), transparent)',
          filter: 'blur(30px)',
        }}
      />

      {/* Ripples Persist - Contamination Echoes */}
      {[...Array(8)].map((_, i) => {
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight - 100;
        
        return (
          <motion.div
            key={`echo-${i}`}
            className="absolute rounded-full border border-indigo-400/20"
            style={{ left: x, top: y }}
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{ 
              width: 80,
              height: 80,
              opacity: [0, 0.4, 0],
            }}
            transition={{ 
              duration: 1.5,
              delay: 2 + i * 0.15, // Echoes after rain stops
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Purple-Grey Palette - Environment Turning Against You */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 2.5, delay: 1 }}
        style={{
          backgroundColor: 'rgba(55, 48, 163, 0.25)',
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
        transition={{ duration: 0.4, delay: 3.1 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}
