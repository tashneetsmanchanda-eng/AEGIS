import { useState } from 'react';
import { FateWheel } from './components/FateWheel';
import { SystemDashboard } from './components/SystemDashboard';
import { EnvironmentPanel } from './components/EnvironmentPanel';
import { AIAgent } from './components/AIAgent';
import { CascadeView } from './components/CascadeView';
import { SystemTransition } from './components/transitions/SystemTransition';
import { LanguageSelector } from './components/LanguageSelector';
import { InfoPanel } from './components/InfoPanel';
import { useLocale } from './contexts/LocaleContext';
import { t } from './i18n/strings';

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
  const { locale } = useLocale();
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

  const handleSystemClick = (system: SystemType) => {
    setPendingSystem(system);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (pendingSystem) {
      setSelectedSystem(pendingSystem);
      setPendingSystem(null);
    }
    // Small delay to ensure smooth fade
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
    <div className="text-white overflow-hidden" style={{ backgroundColor: '#000000', height: '100vh', width: '100vw' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-8 backdrop-blur-sm border-b border-slate-800/50" style={{ backgroundColor: '#000000' }}>
        <h1 className="text-center tracking-[0.25em] uppercase" style={{ fontSize: '1.15rem', fontWeight: 600 }}>
          {t(locale, 'APP_TITLE')}
        </h1>
      </header>
      
      {/* Language Selector */}
      <LanguageSelector />

      {/* Main Content */}
      <main style={{ height: '100vh', paddingTop: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
        {isTransitioning && pendingSystem && (
          <SystemTransition 
            system={pendingSystem} 
            onComplete={handleTransitionComplete}
          />
        )}

        {!selectedSystem && !isTransitioning ? (
          <>
            <div className="w-full flex items-center justify-center" style={{ height: '100%' }}>
              <FateWheel 
                onSystemClick={handleSystemClick}
                location={location}
              />
            </div>
            {/* Instruction Text - Bottom Center (Static UI hint) */}
            <div 
              className="fixed left-1/2 text-center pointer-events-none"
              style={{ 
                bottom: '28px', // 28px from bottom (within 24-32px range)
                transform: 'translateX(-50%)',
                opacity: 0.65 // 65% opacity (within 60-70% range)
              }}
            >
              <p className="text-slate-400 text-xs">
                Hover to preview • Click to analyze
              </p>
            </div>
          </>
        ) : selectedSystem && !isTransitioning ? (
          <div className="w-full overflow-y-auto" style={{ height: '100%', paddingBottom: '96px' }}>
            <div className="max-w-7xl mx-auto py-8 px-8">
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

      {/* Side Panels */}
      {!isTransitioning && (
        <>
          <EnvironmentPanel 
            location={location}
            onLocationChange={setLocation}
            selectedSystem={selectedSystem}
          />
          <AIAgent 
            selectedSystem={selectedSystem}
            location={location}
            isOpen={isChesealOpen}
            onOpen={() => {
              console.log("CHESEAL CLICKED - Opening");
              setIsChesealOpen(true);
            }}
            onClose={() => {
              console.log("CHESEAL CLICKED - Closing");
              setIsChesealOpen(false);
            }}
          />
        </>
      )}

      {/* Cascade View Overlay */}
      {showCascade && selectedSystem && (
        <CascadeView 
          system={selectedSystem}
          location={location}
          onClose={handleCloseCascade}
        />
      )}

      {/* Info Panel - Always visible */}
      <InfoPanel />
    </div>
  );
}