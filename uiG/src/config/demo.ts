/**
 * Demo Mode Configuration
 * When enabled, stabilizes outputs and reduces randomness for demo purposes
 */

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || false;

export const getDemoConfig = () => ({
  enabled: DEMO_MODE,
  stabilizeOutputs: DEMO_MODE,
  reduceRandomness: DEMO_MODE,
  preventSurprisingSwings: DEMO_MODE,
});

