import { useState } from 'react';
import { FateWheel } from './components/FateWheel';
import { SystemDashboard } from './components/SystemDashboard';
import { EnvironmentPanel } from './components/EnvironmentPanel';
import { AIAgent } from './components/AIAgent';
import { CascadeView } from './components/CascadeView';
import { SystemTransition } from './components/transitions/SystemTransition';

// ✅ IMPORT THE NEW INFO PANEL
// Ensure the file is saved as 'InfoPanel.tsx' in your components folder
import { InfoPanel } from './components/InfoPanel';

export type SystemType = 
  | 'flood' 
  | 'cyclone' 
  | 'tsunami' 
  | 'respiratory' 
  | 'diarrhea' 
  | 'cholera' 
  | 'hepatitis' 
  | 'leptospirosis';

export interface LocationData {
  mode: 'city' | 'global' | 'custom';
  city?: string;
  state?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
}

export default function App() {
  const [selectedSystem, setSelectedSystem] = useState<SystemType | null>(null);
  const [location, setLocation] = useState<LocationData>({
    mode: 'city',
    city: 'Mumbai',
    state: 'Maharashtra'
  });
  const [showCascade, setShowCascade] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isChesealOpen, setIsChesealOpen] = useState(false);
  const [pendingSystem, setPendingSystem] = useState<SystemType | null>(null);

  // --- Handlers ---
  const handleSystemClick = (system: SystemType) => {
    setPendingSystem(system);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingSystem) {
      setSelectedSystem(pendingSystem);
      setPendingSystem(null);
    }
    setTimeout(() => {
      setIsTransitioning(false);
    }, 200);
  };

  const handleBackToWheel = () => {
    setSelectedSystem(null);
  };

  const handleCascadeClick = () => {
    setShowCascade(true);
  };

  const handleCloseCascade = () => {
    setShowCascade(false);
  };

  return (
    <div
      className="text-white overflow-hidden bg-black h-screen w-screen relative"
    >
      {/* 1. Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 py-4 px-8 backdrop-blur-sm border-b border-slate-800/50"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      >
        <h1 className="text-center tracking-[0.25em] uppercase text-sm font-semibold text-slate-200">
          AEGIS — AI Public Risk Decision System
        </h1>
      </header>

      {/* 2. Main Content Area (Wheel or Dashboard) */}
      <main
        className="h-screen pt-16 flex items-center justify-center relative z-10 box-border"
      >
        {isTransitioning && pendingSystem && (
          <SystemTransition 
            system={pendingSystem} 
            onComplete={handleTransitionComplete}
          />
        )}

        {!selectedSystem && !isTransitioning ? (
          /* STATE A: FATE WHEEL */
          <>
            <div className="w-full h-full flex items-center justify-center">
              <FateWheel 
                onSystemClick={handleSystemClick}
                location={location}
                // Don't forget to pass riskData here eventually!
                riskData={{}} 
              />
            </div>

            {/* Instruction Text */}
            <div
              className="fixed left-1/2 bottom-7 transform -translate-x-1/2 pointer-events-none opacity-65 z-20"
            >
              <p className="text-slate-400 text-xs">
                Hover to preview • Click to analyze
              </p>
            </div>
          </>
        ) : selectedSystem && !isTransitioning ? (
          /* STATE B: DASHBOARD */
          <div className="w-full h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto py-8 px-8 mb-24">
              <SystemDashboard 
                system={selectedSystem}
                location={location}
                onBack={handleBackToWheel}
                onCascadeClick={handleCascadeClick}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* 3. GLOBAL UI LAYER (Floats above everything) */}
      {/* We use one wrapper with z-index 9999 to manage all floating panels */}
      {!isTransitioning && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          
          {/* A. Info Panel (Bottom Left) */}
          {/* pointer-events-auto is CRITICAL so the button is clickable */}
          <div className="absolute bottom-0 left-0 pointer-events-auto">
             <InfoPanel />
          </div>

          {/* B. Environment Panel (Left Center) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-auto">
            <EnvironmentPanel 
              location={location}
              onLocationChange={setLocation}
              selectedSystem={selectedSystem}
            />
          </div>

          {/* C. CHESEAL Agent (Bottom Right) */}
          <div className="absolute bottom-0 right-0 pointer-events-auto">
            <AIAgent 
              selectedSystem={selectedSystem}
              location={location}
              isOpen={isChesealOpen}
              onOpen={() => setIsChesealOpen(true)}
              onClose={() => setIsChesealOpen(false)}
            />
          </div>

        </div>
      )}

      {/* 4. Cascade Overlay (Topmost) */}
      {showCascade && selectedSystem && (
        <div className="relative z-[10000]">
          <CascadeView 
            system={selectedSystem}
            location={location}
            onClose={handleCloseCascade}
          />
        </div>
      )}

    </div>
  );
}