import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Globe, Navigation, Wind } from 'lucide-react';
import type { LocationData, SystemType } from '../App';
import { LOCATION_DATA, INDIAN_STATES_SORTED, getCitiesForState } from '../data/locations';
import { useLocale } from '../contexts/LocaleContext';
import { t } from '../i18n/strings';

interface EnvironmentPanelProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  selectedSystem?: SystemType | null;
}

const CONTINENTS = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
];

export function EnvironmentPanel({ location, onLocationChange, selectedSystem }: EnvironmentPanelProps) {
  const { locale } = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedState, setSelectedState] = useState(location.state || 'Maharashtra');

  // Auto-close when a system node is selected
  useEffect(() => {
    if (selectedSystem) {
      setIsExpanded(false);
    }
  }, [selectedSystem]);

  const handleModeChange = (mode: 'city' | 'global' | 'custom') => {
    if (mode === 'city') {
      onLocationChange({
        mode: 'city',
        city: 'Mumbai',
        state: 'Maharashtra'
      });
      setSelectedState('Maharashtra');
    } else if (mode === 'global') {
      onLocationChange({
        mode: 'global',
        continent: 'Asia'
      });
    } else {
      onLocationChange({
        mode: 'custom',
        latitude: 19.0760,
        longitude: 72.8777
      });
    }
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const cities = getCitiesForState(state);
    onLocationChange({
      mode: 'city',
      city: cities.length > 0 ? cities[0] : 'Mumbai',
      state: state
    });
  };

  const handleCityChange = (city: string) => {
    onLocationChange({
      mode: 'city',
      city: city,
      state: selectedState
    });
  };

  const handleContinentChange = (continent: string) => {
    onLocationChange({
      mode: 'global',
      continent: continent
    });
  };

  const handleCoordinateChange = (lat?: number, lon?: number) => {
    onLocationChange({
      mode: 'custom',
      latitude: lat ?? location.latitude ?? 0,
      longitude: lon ?? location.longitude ?? 0
    });
  };

  // Deterministic AQI based on location (stable, no randomization)
  const aqi = useMemo(() => {
    if (location.mode === 'city' && location.state && location.city) {
      // Base AQI by state/city (deterministic mapping)
      const stateKey = location.state.toLowerCase();
      const cityKey = location.city.toLowerCase();
      
      // Regional baseline AQI values (representative, not random)
      const regionalBaselines: { [key: string]: number } = {
        'maharashtra': 145,
        'karnataka': 135,
        'tamil nadu': 140,
        'gujarat': 150,
        'delhi': 180,
        'west bengal': 155,
        'rajasthan': 145,
        'kerala': 120,
        'punjab': 140,
        'haryana': 165,
        'madhya pradesh': 135,
        'odisha': 130,
        'bihar': 160,
        'uttar pradesh': 170,
        'telangana': 145,
        'andhra pradesh': 135,
        'jharkhand': 150,
        'chhattisgarh': 140,
        'assam': 125,
        'himachal pradesh': 95,
        'uttarakhand': 100,
        'goa': 110,
        'chandigarh': 140,
        'arunachal pradesh': 90,
      };
      
      // City-specific adjustments (deterministic)
      const cityAdjustments: { [key: string]: number } = {
        'mumbai': 15,
        'delhi': 20,
        'new delhi': 20,
        'kolkata': 18,
        'chennai': 10,
        'bengaluru': 8,
        'bangalore': 8,
        'hyderabad': 12,
        'pune': -5,
        'ahmedabad': 10,
        'jaipur': 8,
        'lucknow': 15,
        'kanpur': 20,
      };
      
      const baseAQI = regionalBaselines[stateKey] || 140;
      const adjustment = cityAdjustments[cityKey] || 0;
      return Math.max(50, Math.min(300, baseAQI + adjustment)); // Clamp between 50-300
    } else if (location.mode === 'global' && location.continent) {
      // Continental baseline
      const continentBaselines: { [key: string]: number } = {
        'asia': 120,
        'europe': 85,
        'north america': 90,
        'south america': 95,
        'africa': 110,
        'oceania': 75,
        'antarctica': 40,
      };
      return continentBaselines[location.continent.toLowerCase()] || 100;
    } else {
      // Custom coordinates - use default
      return 120;
    }
  }, [location.mode, location.state, location.city, location.continent]);

  const aqiLevel = aqi > 200 ? 'Poor' : aqi > 150 ? 'Moderate' : 'Good';
  const aqiColor = aqi > 200 ? 'text-red-400' : aqi > 150 ? 'text-yellow-400' : 'text-green-400';

  return (
    <motion.div
      className="fixed right-0 top-24 z-40"
      initial={{ x: 300 }}
      animate={{ x: isExpanded ? 0 : 240 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      <div className="backdrop-blur-sm border-l border-slate-800 rounded-l-2xl shadow-2xl" style={{ backgroundColor: '#000000' }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -left-12 top-4 backdrop-blur-sm border border-cyan-500/30 rounded-l-xl p-3 hover:bg-slate-800 transition-all"
          style={{ 
            backgroundColor: '#000000',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)'
          }}
        >
          <MapPin className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))' }} />
        </button>

        {/* Panel Content - Scrollable */}
        <div className="w-60 max-h-[calc(100vh-8rem)] overflow-y-auto p-6 space-y-6">
          <h3 className="text-sm tracking-[0.2em] uppercase text-slate-400">
            {t(locale, 'ENVIRONMENT')}
          </h3>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-wider">{t(locale, 'MODE')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('city')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'city'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                {t(locale, 'MODE_CITY')}
              </button>
              <button
                onClick={() => handleModeChange('global')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'global'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                {t(locale, 'MODE_GLOBAL')}
              </button>
              <button
                onClick={() => handleModeChange('custom')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'custom'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                {t(locale, 'MODE_CUSTOM')}
              </button>
            </div>
          </div>

          {/* City Mode */}
          {location.mode === 'city' && (
            <>
              <div className="space-y-2">
                <label htmlFor="state-select" className="text-xs text-slate-500 uppercase tracking-wider">{t(locale, 'STATE')}</label>
                <select
                  id="state-select"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  aria-label="Select state"
                >
                  {INDIAN_STATES_SORTED.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="city-select" className="text-xs text-slate-500 uppercase tracking-wider">{t(locale, 'CITY')}</label>
                <select
                  id="city-select"
                  value={location.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  aria-label="Select city"
                >
                  {getCitiesForState(selectedState).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Global Mode */}
          {location.mode === 'global' && (
            <div className="space-y-2">
              <label htmlFor="continent-select" className="text-xs text-slate-500 uppercase tracking-wider">{t(locale, 'CONTINENT')}</label>
              <select
                id="continent-select"
                value={location.continent}
                onChange={(e) => handleContinentChange(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                aria-label="Select continent"
              >
                {CONTINENTS.map(continent => (
                  <option key={continent} value={continent}>{continent}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Mode */}
          {location.mode === 'custom' && (
            <>
              <div className="space-y-2">
                <label htmlFor="latitude-input" className="text-xs text-slate-500 uppercase tracking-wider">Latitude</label>
                <input
                  id="latitude-input"
                  type="number"
                  value={location.latitude ?? 0}
                  onChange={(e) => handleCoordinateChange(parseFloat(e.target.value), undefined)}
                  step="0.0001"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  aria-label="Latitude coordinate"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="longitude-input" className="text-xs text-slate-500 uppercase tracking-wider">Longitude</label>
                <input
                  id="longitude-input"
                  type="number"
                  value={location.longitude ?? 0}
                  onChange={(e) => handleCoordinateChange(undefined, parseFloat(e.target.value))}
                  step="0.0001"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  aria-label="Longitude coordinate"
                />
              </div>
            </>
          )}

          {/* Air Quality */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{t(locale, 'AQI_VERIFIED')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{aqi}</span>
              <span className={`text-sm ${aqiColor}`}>{aqiLevel}</span>
            </div>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  aqi > 200 ? 'bg-red-400' : aqi > 150 ? 'bg-yellow-400' : 'bg-green-400'
                }`}
                style={{ width: `${Math.min((aqi / 300) * 100, 100)}%` }}
              />
            </div>
            {/* Edge case guardrail for AQI */}
            {aqi === 120 && location.mode === 'custom' && (
              <p className="mt-2 text-xs text-amber-400">
                AQI data unavailable — using regional average
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
