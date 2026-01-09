/**
 * Canonical location data for AEGIS uiG
 * All data is alphabetically sorted (case-insensitive)
 */

export interface LocationDataStructure {
  countries: string[];
  states: {
    [country: string]: string[];
  };
  cities: {
    [stateOrCountry: string]: string[];
  };
}

// Major countries (alphabetically sorted)
const COUNTRIES = [
  'Australia',
  'Brazil',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Japan',
  'Russia',
  'South Africa',
  'United Kingdom',
  'United States',
];

// Indian states and Union Territories (alphabetically sorted)
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Cities by Indian state (alphabetically sorted within each state)
const INDIAN_CITIES: { [state: string]: string[] } = {
  'Andhra Pradesh': ['Guntur', 'Hyderabad', 'Kakinada', 'Nellore', 'Rajahmundry', 'Tirupati', 'Vijayawada', 'Visakhapatnam'],
  'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang'],
  'Assam': ['Dibrugarh', 'Guwahati', 'Jorhat', 'Silchar', 'Tezpur'],
  'Bihar': ['Bhagalpur', 'Gaya', 'Muzaffarpur', 'Patna'],
  'Chandigarh': ['Chandigarh'],
  'Chhattisgarh': ['Bhilai', 'Bilaspur', 'Durg', 'Raipur'],
  'Delhi': ['New Delhi'],
  'Goa': ['Margao', 'Panaji', 'Vasco da Gama'],
  'Gujarat': ['Ahmedabad', 'Gandhinagar', 'Rajkot', 'Surat', 'Vadodara'],
  'Haryana': ['Ambala', 'Faridabad', 'Gurugram', 'Panipat'],
  'Himachal Pradesh': ['Shimla', 'Solan'],
  'Jharkhand': ['Dhanbad', 'Jamshedpur', 'Ranchi'],
  'Karnataka': ['Bengaluru', 'Hubli', 'Mangaluru', 'Mysuru'],
  'Kerala': ['Kochi', 'Kozhikode', 'Thiruvananthapuram', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Gwalior', 'Indore', 'Jabalpur'],
  'Maharashtra': ['Aurangabad', 'Mumbai', 'Nagpur', 'Nashik', 'Pune'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri', 'Rourkela'],
  'Punjab': ['Amritsar', 'Jalandhar', 'Ludhiana'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Nizamabad', 'Warangal'],
  'Uttar Pradesh': ['Agra', 'Kanpur', 'Lucknow', 'Varanasi'],
  'Uttarakhand': ['Dehradun', 'Haridwar'],
  'West Bengal': ['Asansol', 'Durgapur', 'Howrah', 'Kolkata'],
};

// Global cities by country (alphabetically sorted)
const GLOBAL_CITIES: { [country: string]: string[] } = {
  'Australia': ['Adelaide', 'Brisbane', 'Melbourne', 'Perth', 'Sydney'],
  'Brazil': ['Brasília', 'Rio de Janeiro', 'São Paulo'],
  'Canada': ['Montreal', 'Toronto', 'Vancouver'],
  'China': ['Beijing', 'Shanghai', 'Shenzhen'],
  'France': ['Lyon', 'Marseille', 'Paris'],
  'Germany': ['Berlin', 'Frankfurt', 'Munich'],
  'Japan': ['Kyoto', 'Osaka', 'Tokyo'],
  'Russia': ['Moscow', 'Saint Petersburg'],
  'South Africa': ['Cape Town', 'Johannesburg'],
  'United Kingdom': ['Birmingham', 'London', 'Manchester'],
  'United States': ['Chicago', 'Los Angeles', 'New York', 'San Francisco'],
};

// Helper function to sort arrays alphabetically (case-insensitive)
function sortAlphabetically<T extends string>(arr: T[]): T[] {
  return [...arr].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

// Build the location data structure
export const LOCATION_DATA: LocationDataStructure = {
  countries: sortAlphabetically(COUNTRIES),
  states: {
    'India': sortAlphabetically(INDIAN_STATES),
  },
  cities: (() => {
    const cities: { [key: string]: string[] } = {};
    
    // Add Indian cities (sorted)
    Object.keys(INDIAN_CITIES).forEach(state => {
      cities[state] = sortAlphabetically(INDIAN_CITIES[state]);
    });
    
    // Add global cities (sorted)
    Object.keys(GLOBAL_CITIES).forEach(country => {
      cities[country] = sortAlphabetically(GLOBAL_CITIES[country]);
    });
    
    return cities;
  })(),
};

// Export sorted arrays for direct use
export const COUNTRIES_SORTED = LOCATION_DATA.countries;
export const INDIAN_STATES_SORTED = LOCATION_DATA.states['India'] || [];
export const getCitiesForState = (stateOrCountry: string): string[] => {
  return LOCATION_DATA.cities[stateOrCountry] || [];
};

