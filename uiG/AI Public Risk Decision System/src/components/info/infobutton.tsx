import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Info, X } from 'lucide-react';
// FIX: Changed './InfoPanel' to './infopanel' to match your file name
import { InfoPanel } from './infopanel'; 

export function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          height: '44px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '22px',
          backgroundColor: open ? '#06b6d4' : 'rgba(10, 10, 10, 0.9)', // Increased opacity
          backdropFilter: 'blur(8px)',
          color: open ? '#000' : '#06b6d4',
          border: '1px solid rgba(6,182,212,0.4)',
          cursor: 'pointer',
          zIndex: 9999, // Force it to the top layer
          boxShadow: '0 4px 12px rgba(6,182,212,0.15)',
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {open ? <X size={16} /> : <Info size={16} />}
        <span>INFO</span>
      </motion.button>

      <AnimatePresence>
        {open && <InfoPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}