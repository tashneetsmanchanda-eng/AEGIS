import { useEffect } from 'react';
import { motion } from 'motion/react';

interface TsunamiTransitionProps {
  onComplete: () => void;
}

export function TsunamiTransition({ onComplete }: TsunamiTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000); // 4 seconds total

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#0a1a2e' }}>
      {/* Background Layer - Horizon Line (Starts First) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ 
          height: '0%',
          transform: 'skewY(0deg)',
        }}
        animate={{ 
          height: '100%',
          transform: 'skewY(-0.3deg)', // Horizon slowly tilts
        }}
        transition={{ duration: 3, delay: 0.2, ease: 'easeIn' }}
        style={{
          background: 'linear-gradient(to top, rgba(6, 78, 59, 0.6), rgba(14, 116, 144, 0.4))',
        }}
      />

      {/* Midground Layer - Light Compression (Starts Second) */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          opacity: 0,
          transform: 'scaleY(1)',
        }}
        animate={{ 
          opacity: 0.4,
          transform: 'scaleY(0.95)', // Light compresses vertically
        }}
        transition={{ duration: 2.5, delay: 0.5 }}
        style={{
          background: 'linear-gradient(180deg, rgba(147, 197, 253, 0.15) 0%, transparent 50%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Foreground Layer - Mass Illusion (Starts Last) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ height: '0%', opacity: 0 }}
        animate={{ height: '100%', opacity: 0.7 }}
        transition={{ duration: 3.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: 'linear-gradient(to top, rgba(2, 6, 23, 0.8), rgba(6, 78, 59, 0.6))',
        }}
      />

      {/* Gravity Feels Altered - Vertical Compression */}
      <motion.div
        className="absolute inset-0"
        initial={{ 
          transform: 'scaleY(1)',
          filter: 'blur(0px)',
        }}
        animate={{ 
          transform: 'scaleY(0.92)',
          filter: 'blur(8px)',
        }}
        transition={{ duration: 3, delay: 1 }}
      />

      {/* Soundless Submersion - Depth Layers */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.3] }}
        transition={{ duration: 2.5, delay: 1.5 }}
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(6, 182, 212, 0.2) 100%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Atmospheric Perspective - Light Falloff */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2.5, delay: 1 }}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />

      {/* Fade to Black - Soundless */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 3.5 }}
        style={{ backgroundColor: '#000000' }}
      />
    </div>
  );
}

