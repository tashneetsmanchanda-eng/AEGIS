/**
 * Complete Indian States and Cities Data
 * All 28 States + 8 Union Territories
 */

export interface City {
  name: string
  lat: number
  lng: number
  isCapital?: boolean
}

export interface State {
  name: string
  code: string
  cities: City[]
}

export const INDIAN_STATES: State[] = [
  // --- STATES (28) ---
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    cities: [
      { name: 'Amaravati', lat: 16.5062, lng: 80.648, isCapital: true },
      { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
      { name: 'Vijayawada', lat: 16.5062, lng: 80.648 },
      { name: 'Guntur', lat: 16.3067, lng: 80.4365 },
      { name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
    ]
  },
  {
    name: 'Arunachal Pradesh',
    code: 'AR',
    cities: [
      { name: 'Itanagar', lat: 27.0844, lng: 93.6053, isCapital: true },
      { name: 'Naharlagun', lat: 27.1044, lng: 93.6945 },
      { name: 'Pasighat', lat: 28.0670, lng: 95.3269 },
    ]
  },
  {
    name: 'Assam',
    code: 'AS',
    cities: [
      { name: 'Dispur', lat: 26.1445, lng: 91.7362, isCapital: true },
      { name: 'Guwahati', lat: 26.1445, lng: 91.7362 },
      { name: 'Silchar', lat: 24.8333, lng: 92.7789 },
      { name: 'Dibrugarh', lat: 27.4728, lng: 94.912 },
      { name: 'Jorhat', lat: 26.7509, lng: 94.2037 },
    ]
  },
  {
    name: 'Bihar',
    code: 'BR',
    cities: [
      { name: 'Patna', lat: 25.5941, lng: 85.1376, isCapital: true },
      { name: 'Gaya', lat: 24.7914, lng: 85.0002 },
      { name: 'Bhagalpur', lat: 25.2425, lng: 86.9842 },
      { name: 'Muzaffarpur', lat: 26.1209, lng: 85.3647 },
      { name: 'Darbhanga', lat: 26.1542, lng: 85.8918 },
    ]
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    cities: [
      { name: 'Raipur', lat: 21.2514, lng: 81.6296, isCapital: true },
      { name: 'Bhilai', lat: 21.2094, lng: 81.4285 },
      { name: 'Bilaspur', lat: 22.0797, lng: 82.1391 },
      { name: 'Korba', lat: 22.3595, lng: 82.7501 },
    ]
  },
  {
    name: 'Goa',
    code: 'GA',
    cities: [
      { name: 'Panaji', lat: 15.4909, lng: 73.8278, isCapital: true },
      { name: 'Margao', lat: 15.2832, lng: 73.9862 },
      { name: 'Vasco da Gama', lat: 15.3980, lng: 73.8113 },
    ]
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    cities: [
      { name: 'Gandhinagar', lat: 23.2156, lng: 72.6369, isCapital: true },
      { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
      { name: 'Surat', lat: 21.1702, lng: 72.8311 },
      { name: 'Vadodara', lat: 22.3072, lng: 73.1812 },
      { name: 'Rajkot', lat: 22.3039, lng: 70.8022 },
    ]
  },
  {
    name: 'Haryana',
    code: 'HR',
    cities: [
      { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, isCapital: true },
      { name: 'Faridabad', lat: 28.4089, lng: 77.3178 },
      { name: 'Gurgaon', lat: 28.4595, lng: 77.0266 },
      { name: 'Panipat', lat: 29.3909, lng: 76.9635 },
      { name: 'Ambala', lat: 30.3782, lng: 76.7767 },
    ]
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    cities: [
      { name: 'Shimla', lat: 31.1048, lng: 77.1734, isCapital: true },
      { name: 'Dharamshala', lat: 32.2190, lng: 76.3234 },
      { name: 'Manali', lat: 32.2396, lng: 77.1887 },
      { name: 'Kullu', lat: 31.9579, lng: 77.1095 },
    ]
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    cities: [
      { name: 'Ranchi', lat: 23.3441, lng: 85.3096, isCapital: true },
      { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029 },
      { name: 'Dhanbad', lat: 23.7957, lng: 86.4304 },
      { name: 'Bokaro', lat: 23.6693, lng: 86.1511 },
    ]
  },
  {
    name: 'Karnataka',
    code: 'KA',
    cities: [
      { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, isCapital: true },
      { name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
      { name: 'Hubli', lat: 15.3647, lng: 75.124 },
      { name: 'Mangaluru', lat: 12.9141, lng: 74.856 },
      { name: 'Belgaum', lat: 15.8497, lng: 74.4977 },
    ]
  },
  {
    name: 'Kerala',
    code: 'KL',
    cities: [
      { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, isCapital: true },
      { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
      { name: 'Kozhikode', lat: 11.2588, lng: 75.7804 },
      { name: 'Thrissur', lat: 10.5276, lng: 76.2144 },
      { name: 'Kannur', lat: 11.8745, lng: 75.3704 },
    ]
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    cities: [
      { name: 'Bhopal', lat: 23.2599, lng: 77.4126, isCapital: true },
      { name: 'Indore', lat: 22.7196, lng: 75.8577 },
      { name: 'Jabalpur', lat: 23.1815, lng: 79.9864 },
      { name: 'Gwalior', lat: 26.2183, lng: 78.1828 },
      { name: 'Ujjain', lat: 23.1765, lng: 75.7885 },
    ]
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    cities: [
      { name: 'Mumbai', lat: 19.076, lng: 72.8777, isCapital: true },
      { name: 'Pune', lat: 18.5204, lng: 73.8567 },
      { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
      { name: 'Nashik', lat: 19.9975, lng: 73.7898 },
      { name: 'Aurangabad', lat: 19.8762, lng: 75.3433 },
    ]
  },
  {
    name: 'Manipur',
    code: 'MN',
    cities: [
      { name: 'Imphal', lat: 24.8170, lng: 93.9368, isCapital: true },
      { name: 'Thoubal', lat: 24.6383, lng: 94.0116 },
      { name: 'Bishnupur', lat: 24.6266, lng: 93.7769 },
    ]
  },
  {
    name: 'Meghalaya',
    code: 'ML',
    cities: [
      { name: 'Shillong', lat: 25.5788, lng: 91.8933, isCapital: true },
      { name: 'Tura', lat: 25.5143, lng: 90.2003 },
      { name: 'Cherrapunji', lat: 25.2700, lng: 91.7320 },
    ]
  },
  {
    name: 'Mizoram',
    code: 'MZ',
    cities: [
      { name: 'Aizawl', lat: 23.7307, lng: 92.7173, isCapital: true },
      { name: 'Lunglei', lat: 22.8879, lng: 92.7265 },
    ]
  },
  {
    name: 'Nagaland',
    code: 'NL',
    cities: [
      { name: 'Kohima', lat: 25.6751, lng: 94.1086, isCapital: true },
      { name: 'Dimapur', lat: 25.9042, lng: 93.7266 },
    ]
  },
  {
    name: 'Odisha',
    code: 'OD',
    cities: [
      { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, isCapital: true },
      { name: 'Cuttack', lat: 20.4625, lng: 85.8828 },
      { name: 'Rourkela', lat: 22.2604, lng: 84.8536 },
      { name: 'Berhampur', lat: 19.3149, lng: 84.7941 },
      { name: 'Sambalpur', lat: 21.4669, lng: 83.9812 },
    ]
  },
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, isCapital: true },
      { name: 'Ludhiana', lat: 30.901, lng: 75.8573 },
      { name: 'Amritsar', lat: 31.634, lng: 74.8723 },
      { name: 'Jalandhar', lat: 31.326, lng: 75.5762 },
      { name: 'Patiala', lat: 30.34, lng: 76.3869 },
    ]
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    cities: [
      { name: 'Jaipur', lat: 26.9124, lng: 75.7873, isCapital: true },
      { name: 'Jodhpur', lat: 26.2389, lng: 73.0243 },
      { name: 'Udaipur', lat: 24.5854, lng: 73.7125 },
      { name: 'Kota', lat: 25.2138, lng: 75.8648 },
      { name: 'Ajmer', lat: 26.4499, lng: 74.6399 },
    ]
  },
  {
    name: 'Sikkim',
    code: 'SK',
    cities: [
      { name: 'Gangtok', lat: 27.3389, lng: 88.6065, isCapital: true },
      { name: 'Namchi', lat: 27.1664, lng: 88.3636 },
      { name: 'Pelling', lat: 27.3000, lng: 88.2300 },
    ]
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    cities: [
      { name: 'Chennai', lat: 13.0827, lng: 80.2707, isCapital: true },
      { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
      { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
      { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
      { name: 'Salem', lat: 11.6643, lng: 78.146 },
    ]
  },
  {
    name: 'Telangana',
    code: 'TS',
    cities: [
      { name: 'Hyderabad', lat: 17.385, lng: 78.4867, isCapital: true },
      { name: 'Warangal', lat: 17.9784, lng: 79.5941 },
      { name: 'Nizamabad', lat: 18.6725, lng: 78.094 },
      { name: 'Karimnagar', lat: 18.4386, lng: 79.1288 },
      { name: 'Khammam', lat: 17.2473, lng: 80.1514 },
    ]
  },
  {
    name: 'Tripura',
    code: 'TR',
    cities: [
      { name: 'Agartala', lat: 23.8315, lng: 91.2868, isCapital: true },
      { name: 'Udaipur', lat: 23.5333, lng: 91.4833 },
    ]
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      { name: 'Lucknow', lat: 26.8467, lng: 80.9462, isCapital: true },
      { name: 'Kanpur', lat: 26.4499, lng: 80.3319 },
      { name: 'Varanasi', lat: 25.3176, lng: 82.9739 },
      { name: 'Agra', lat: 27.1767, lng: 78.0081 },
      { name: 'Prayagraj', lat: 25.4358, lng: 81.8463 },
      { name: 'Noida', lat: 28.5355, lng: 77.391 },
    ]
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    cities: [
      { name: 'Dehradun', lat: 30.3165, lng: 78.0322, isCapital: true },
      { name: 'Haridwar', lat: 29.9457, lng: 78.1642 },
      { name: 'Rishikesh', lat: 30.0869, lng: 78.2676 },
      { name: 'Nainital', lat: 29.3919, lng: 79.4542 },
    ]
  },
  {
    name: 'West Bengal',
    code: 'WB',
    cities: [
      { name: 'Kolkata', lat: 22.5726, lng: 88.3639, isCapital: true },
      { name: 'Howrah', lat: 22.5958, lng: 88.2636 },
      { name: 'Durgapur', lat: 23.5204, lng: 87.3119 },
      { name: 'Asansol', lat: 23.6739, lng: 86.9524 },
      { name: 'Siliguri', lat: 26.7271, lng: 88.3953 },
    ]
  },

  // --- UNION TERRITORIES (8) ---
  {
    name: 'Delhi',
    code: 'DL',
    cities: [
      { name: 'New Delhi', lat: 28.6139, lng: 77.209, isCapital: true },
      { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
    ]
  },
  {
    name: 'Jammu & Kashmir',
    code: 'JK',
    cities: [
      { name: 'Srinagar', lat: 34.0837, lng: 74.7973, isCapital: true },
      { name: 'Jammu', lat: 32.7266, lng: 74.8570 },
      { name: 'Leh', lat: 34.1526, lng: 77.5771 },
    ]
  },
  {
    name: 'Ladakh',
    code: 'LA',
    cities: [
      { name: 'Leh', lat: 34.1526, lng: 77.5771, isCapital: true },
      { name: 'Kargil', lat: 34.5539, lng: 76.1349 },
    ]
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    cities: [
      { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, isCapital: true },
    ]
  },
  {
    name: 'Puducherry',
    code: 'PY',
    cities: [
      { name: 'Puducherry', lat: 11.9416, lng: 79.8083, isCapital: true },
      { name: 'Karaikal', lat: 10.9254, lng: 79.8380 },
    ]
  },
  {
    name: 'Andaman & Nicobar',
    code: 'AN',
    cities: [
      { name: 'Port Blair', lat: 11.6234, lng: 92.7265, isCapital: true },
    ]
  },
  {
    name: 'Dadra & Nagar Haveli',
    code: 'DN',
    cities: [
      { name: 'Silvassa', lat: 20.2766, lng: 73.0169, isCapital: true },
    ]
  },
  {
    name: 'Lakshadweep',
    code: 'LD',
    cities: [
      { name: 'Kavaratti', lat: 10.5626, lng: 72.6369, isCapital: true },
    ]
  },
]

// International locations
export const INTERNATIONAL_LOCATIONS: City[] = [
  { name: 'Dhaka', lat: 23.8103, lng: 90.4125 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018 },
  { name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Kathmandu', lat: 27.7172, lng: 85.324 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
]
