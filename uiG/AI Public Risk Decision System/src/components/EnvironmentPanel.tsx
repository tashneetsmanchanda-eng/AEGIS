import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Globe, Navigation, Wind } from 'lucide-react';
import type { LocationData, SystemType } from '../App';

interface EnvironmentPanelProps {
  location: LocationData;
  onLocationChange: (location: LocationData) => void;
  selectedSystem?: SystemType | null;
}

const INDIAN_CITIES = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Delhi': ['New Delhi'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
};

const CONTINENTS = [
  'Asia',
  'Europe',
  'North America',
  'South America',
  'Africa',
  'Oceania',
  'Antarctica'
];

export function EnvironmentPanel({ location, onLocationChange, selectedSystem }: EnvironmentPanelProps) {
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
    const cities = INDIAN_CITIES[state as keyof typeof INDIAN_CITIES];
    onLocationChange({
      mode: 'city',
      city: cities[0],
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

  // Mock AQI data
  const aqi = location.mode === 'city' 
    ? Math.floor(120 + Math.random() * 80)
    : location.mode === 'global'
    ? Math.floor(80 + Math.random() * 60)
    : Math.floor(100 + Math.random() * 70);

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
          className="absolute -left-12 top-4 backdrop-blur-sm border border-slate-800 rounded-l-xl p-3 hover:bg-slate-800 transition-colors"
          style={{ backgroundColor: '#000000' }}
        >
          <MapPin className="w-5 h-5 text-slate-400" />
        </button>

        {/* Panel Content - Scrollable */}
        <div className="w-60 max-h-[calc(100vh-8rem)] overflow-y-auto p-6 space-y-6">
          <h3 className="text-sm tracking-[0.2em] uppercase text-slate-400">
            Environment
          </h3>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-wider">Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('city')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'city'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                City
              </button>
              <button
                onClick={() => handleModeChange('global')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'global'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                Global
              </button>
              <button
                onClick={() => handleModeChange('custom')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${
                  location.mode === 'custom'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* City Mode */}
          {location.mode === 'city' && (
            <>
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-wider">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {Object.keys(INDIAN_CITIES).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-wider">City</label>
                <select
                  value={location.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  {INDIAN_CITIES[selectedState as keyof typeof INDIAN_CITIES].map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Global Mode */}
          {location.mode === 'global' && (
            <div className="space-y-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider">Continent</label>
              <select
                value={location.continent}
                onChange={(e) => handleContinentChange(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
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
                <label className="text-xs text-slate-500 uppercase tracking-wider">Latitude</label>
                <input
                  type="number"
                  value={location.latitude ?? 0}
                  onChange={(e) => handleCoordinateChange(parseFloat(e.target.value), undefined)}
                  step="0.0001"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Longitude</label>
                <input
                  type="number"
                  value={location.longitude ?? 0}
                  onChange={(e) => handleCoordinateChange(undefined, parseFloat(e.target.value))}
                  step="0.0001"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </>
          )}

          {/* Air Quality */}
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">Air Quality</span>
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
