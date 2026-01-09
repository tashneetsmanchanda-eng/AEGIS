import { motion } from 'motion/react';
import type { SystemType } from '../../App';
import { FloodTransition } from './FloodTransition';
import { CycloneTransition } from './CycloneTransition';
import { TsunamiTransition } from './TsunamiTransition';
import { RespiratoryTransition } from './RespiratoryTransition';
import { DiarrheaTransition } from './DiarrheaTransition';
import { CholeraTransition } from './CholeraTransition';
import { HepatitisTransition } from './HepatitisTransition';
import { LeptospirosisTransition } from './LeptospirosisTransition';

interface SystemTransitionProps {
  system: SystemType;
  onComplete: () => void;
}

export function SystemTransition({ system, onComplete }: SystemTransitionProps) {
  const transitions = {
    flood: FloodTransition,
    cyclone: CycloneTransition,
    tsunami: TsunamiTransition,
    respiratory: RespiratoryTransition,
    diarrhea: DiarrheaTransition,
    cholera: CholeraTransition,
    hepatitis: HepatitisTransition,
    leptospirosis: LeptospirosisTransition
  };

  const TransitionComponent = transitions[system];

  return (
    <motion.div
      className="fixed inset-0 z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundColor: '#000000' }}
    >
      <TransitionComponent onComplete={onComplete} />
    </motion.div>
  );
}
