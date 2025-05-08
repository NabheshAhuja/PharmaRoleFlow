import axios from 'axios';

interface State {
  id: string;
  name: string;
}

interface City {
  id: string;
  name: string;
  state_id: string;
}

// Cache the results to avoid repeated API calls
const stateCache: State[] = [];
const cityCache: Map<string, City[]> = new Map();

/**
 * Service to fetch Indian states and cities using the India Post API
 */
export const IndiaLocationService = {
  /**
   * Get access token for the API
   */
  async getAccessToken(): Promise<string> {
    try {
      const response = await axios.get('https://www.universal-tutorial.com/api/getaccesstoken', {
        headers: {
          "Accept": "application/json",
          "api-token": "gBNGwV3-S6eqAG4s_EUyGBg9_EHRv4qu7S4k8ZpWG6Kq9w7xnPnEagU0cjBYyjw-3-4",
          "user-email": "pharmadist@test.com"
        }
      });
      
      return response.data.auth_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error("Failed to get access token. Please try again later.");
    }
  },
  
  /**
   * Fetch all Indian states
   */
  async getAllStates(): Promise<State[]> {
    try {
      // Return cached results if available
      if (stateCache.length > 0) {
        return stateCache;
      }
      
      // Use a fallback list of major Indian states
      const fallbackStates = [
        { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
        { id: 'Bihar', name: 'Bihar' },
        { id: 'Delhi', name: 'Delhi' },
        { id: 'Gujarat', name: 'Gujarat' },
        { id: 'Haryana', name: 'Haryana' },
        { id: 'Karnataka', name: 'Karnataka' },
        { id: 'Kerala', name: 'Kerala' },
        { id: 'Madhya Pradesh', name: 'Madhya Pradesh' },
        { id: 'Maharashtra', name: 'Maharashtra' },
        { id: 'Punjab', name: 'Punjab' },
        { id: 'Rajasthan', name: 'Rajasthan' },
        { id: 'Tamil Nadu', name: 'Tamil Nadu' },
        { id: 'Telangana', name: 'Telangana' },
        { id: 'Uttar Pradesh', name: 'Uttar Pradesh' },
        { id: 'West Bengal', name: 'West Bengal' }
      ];
      
      // Cache the states
      stateCache.push(...fallbackStates);
      
      return fallbackStates;
    } catch (error) {
      console.error('Error fetching states:', error);
      // Return a fallback for important states in India
      const fallbackStates = [
        { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
        { id: 'Bihar', name: 'Bihar' },
        { id: 'Delhi', name: 'Delhi' },
        { id: 'Gujarat', name: 'Gujarat' },
        { id: 'Haryana', name: 'Haryana' },
        { id: 'Karnataka', name: 'Karnataka' },
        { id: 'Kerala', name: 'Kerala' },
        { id: 'Madhya Pradesh', name: 'Madhya Pradesh' },
        { id: 'Maharashtra', name: 'Maharashtra' },
        { id: 'Punjab', name: 'Punjab' },
        { id: 'Rajasthan', name: 'Rajasthan' },
        { id: 'Tamil Nadu', name: 'Tamil Nadu' },
        { id: 'Telangana', name: 'Telangana' },
        { id: 'Uttar Pradesh', name: 'Uttar Pradesh' },
        { id: 'West Bengal', name: 'West Bengal' }
      ];
      
      // Cache the fallback states
      stateCache.push(...fallbackStates);
      
      return fallbackStates;
    }
  },
  
  /**
   * Fetch cities for a specific state
   */
  async getCitiesByState(stateName: string): Promise<City[]> {
    try {
      // Return cached results if available
      if (cityCache.has(stateName)) {
        return cityCache.get(stateName) || [];
      }
      
      // Use local fallback data for cities
      const fallbackCities = getFallbackCities(stateName);
      
      // Cache the cities for this state
      cityCache.set(stateName, fallbackCities);
      
      return fallbackCities;
    } catch (error) {
      console.error(`Error fetching cities for state ${stateName}:`, error);
      
      // Get the fallback cities based on state
      const fallbackCities = getFallbackCities(stateName);
      
      // Cache the fallback cities
      cityCache.set(stateName, fallbackCities);
      
      return fallbackCities;
    }
  },
  
  /**
   * Fetch PIN code details for a specific city
   */
  async getPincodesByCity(city: string): Promise<string[]> {
    try {
      // This is a temporary implementation - in a real system, we would use an API
      // For now, we're just generating some mock data
      
      return ['110001', '110002', '110003'];
    } catch (error) {
      console.error(`Error fetching pincodes for city ${city}:`, error);
      return ['400001', '400002', '400003'];
    }
  }
};

/**
 * Get a fallback list of cities for a specific state
 */
function getFallbackCities(stateName: string): City[] {
  const fallbacks: Record<string, City[]> = {
    'Delhi': [
      { id: 'New Delhi', name: 'New Delhi', state_id: 'Delhi' },
      { id: 'Delhi', name: 'Delhi', state_id: 'Delhi' },
      { id: 'Dwarka', name: 'Dwarka', state_id: 'Delhi' },
      { id: 'Rohini', name: 'Rohini', state_id: 'Delhi' },
      { id: 'Vikaspuri', name: 'Vikaspuri', state_id: 'Delhi' }
    ],
    'Maharashtra': [
      { id: 'Mumbai', name: 'Mumbai', state_id: 'Maharashtra' },
      { id: 'Pune', name: 'Pune', state_id: 'Maharashtra' },
      { id: 'Nagpur', name: 'Nagpur', state_id: 'Maharashtra' },
      { id: 'Thane', name: 'Thane', state_id: 'Maharashtra' },
      { id: 'Nashik', name: 'Nashik', state_id: 'Maharashtra' },
      { id: 'Aurangabad', name: 'Aurangabad', state_id: 'Maharashtra' },
      { id: 'Solapur', name: 'Solapur', state_id: 'Maharashtra' },
      { id: 'Kolhapur', name: 'Kolhapur', state_id: 'Maharashtra' }
    ],
    'Karnataka': [
      { id: 'Bangalore', name: 'Bangalore', state_id: 'Karnataka' },
      { id: 'Mysore', name: 'Mysore', state_id: 'Karnataka' },
      { id: 'Hubli', name: 'Hubli', state_id: 'Karnataka' },
      { id: 'Mangalore', name: 'Mangalore', state_id: 'Karnataka' },
      { id: 'Belgaum', name: 'Belgaum', state_id: 'Karnataka' },
      { id: 'Gulbarga', name: 'Gulbarga', state_id: 'Karnataka' }
    ],
    'Tamil Nadu': [
      { id: 'Chennai', name: 'Chennai', state_id: 'Tamil Nadu' },
      { id: 'Coimbatore', name: 'Coimbatore', state_id: 'Tamil Nadu' },
      { id: 'Madurai', name: 'Madurai', state_id: 'Tamil Nadu' },
      { id: 'Tiruchirappalli', name: 'Tiruchirappalli', state_id: 'Tamil Nadu' },
      { id: 'Salem', name: 'Salem', state_id: 'Tamil Nadu' },
      { id: 'Tirunelveli', name: 'Tirunelveli', state_id: 'Tamil Nadu' },
      { id: 'Tiruppur', name: 'Tiruppur', state_id: 'Tamil Nadu' },
      { id: 'Vellore', name: 'Vellore', state_id: 'Tamil Nadu' }
    ],
    'Telangana': [
      { id: 'Hyderabad', name: 'Hyderabad', state_id: 'Telangana' },
      { id: 'Warangal', name: 'Warangal', state_id: 'Telangana' },
      { id: 'Nizamabad', name: 'Nizamabad', state_id: 'Telangana' },
      { id: 'Karimnagar', name: 'Karimnagar', state_id: 'Telangana' },
      { id: 'Khammam', name: 'Khammam', state_id: 'Telangana' }
    ],
    'Gujarat': [
      { id: 'Ahmedabad', name: 'Ahmedabad', state_id: 'Gujarat' },
      { id: 'Surat', name: 'Surat', state_id: 'Gujarat' },
      { id: 'Vadodara', name: 'Vadodara', state_id: 'Gujarat' },
      { id: 'Rajkot', name: 'Rajkot', state_id: 'Gujarat' },
      { id: 'Bhavnagar', name: 'Bhavnagar', state_id: 'Gujarat' },
      { id: 'Jamnagar', name: 'Jamnagar', state_id: 'Gujarat' },
      { id: 'Gandhinagar', name: 'Gandhinagar', state_id: 'Gujarat' }
    ],
    'West Bengal': [
      { id: 'Kolkata', name: 'Kolkata', state_id: 'West Bengal' },
      { id: 'Howrah', name: 'Howrah', state_id: 'West Bengal' },
      { id: 'Durgapur', name: 'Durgapur', state_id: 'West Bengal' },
      { id: 'Asansol', name: 'Asansol', state_id: 'West Bengal' },
      { id: 'Siliguri', name: 'Siliguri', state_id: 'West Bengal' },
      { id: 'Bardhaman', name: 'Bardhaman', state_id: 'West Bengal' }
    ],
    'Uttar Pradesh': [
      { id: 'Lucknow', name: 'Lucknow', state_id: 'Uttar Pradesh' },
      { id: 'Kanpur', name: 'Kanpur', state_id: 'Uttar Pradesh' },
      { id: 'Varanasi', name: 'Varanasi', state_id: 'Uttar Pradesh' },
      { id: 'Agra', name: 'Agra', state_id: 'Uttar Pradesh' },
      { id: 'Meerut', name: 'Meerut', state_id: 'Uttar Pradesh' },
      { id: 'Allahabad', name: 'Allahabad', state_id: 'Uttar Pradesh' },
      { id: 'Bareilly', name: 'Bareilly', state_id: 'Uttar Pradesh' },
      { id: 'Aligarh', name: 'Aligarh', state_id: 'Uttar Pradesh' },
      { id: 'Moradabad', name: 'Moradabad', state_id: 'Uttar Pradesh' },
      { id: 'Saharanpur', name: 'Saharanpur', state_id: 'Uttar Pradesh' }
    ],
    'Andhra Pradesh': [
      { id: 'Visakhapatnam', name: 'Visakhapatnam', state_id: 'Andhra Pradesh' },
      { id: 'Vijayawada', name: 'Vijayawada', state_id: 'Andhra Pradesh' },
      { id: 'Guntur', name: 'Guntur', state_id: 'Andhra Pradesh' },
      { id: 'Nellore', name: 'Nellore', state_id: 'Andhra Pradesh' },
      { id: 'Kurnool', name: 'Kurnool', state_id: 'Andhra Pradesh' },
      { id: 'Kakinada', name: 'Kakinada', state_id: 'Andhra Pradesh' },
      { id: 'Tirupati', name: 'Tirupati', state_id: 'Andhra Pradesh' },
      { id: 'Rajamahendravaram', name: 'Rajamahendravaram', state_id: 'Andhra Pradesh' }
    ],
    'Bihar': [
      { id: 'Patna', name: 'Patna', state_id: 'Bihar' },
      { id: 'Gaya', name: 'Gaya', state_id: 'Bihar' },
      { id: 'Bhagalpur', name: 'Bhagalpur', state_id: 'Bihar' },
      { id: 'Muzaffarpur', name: 'Muzaffarpur', state_id: 'Bihar' },
      { id: 'Darbhanga', name: 'Darbhanga', state_id: 'Bihar' },
      { id: 'Purnia', name: 'Purnia', state_id: 'Bihar' }
    ],
    'Haryana': [
      { id: 'Faridabad', name: 'Faridabad', state_id: 'Haryana' },
      { id: 'Gurgaon', name: 'Gurgaon', state_id: 'Haryana' },
      { id: 'Panipat', name: 'Panipat', state_id: 'Haryana' },
      { id: 'Ambala', name: 'Ambala', state_id: 'Haryana' },
      { id: 'Rohtak', name: 'Rohtak', state_id: 'Haryana' },
      { id: 'Hisar', name: 'Hisar', state_id: 'Haryana' },
      { id: 'Karnal', name: 'Karnal', state_id: 'Haryana' }
    ],
    'Kerala': [
      { id: 'Thiruvananthapuram', name: 'Thiruvananthapuram', state_id: 'Kerala' },
      { id: 'Kochi', name: 'Kochi', state_id: 'Kerala' },
      { id: 'Kozhikode', name: 'Kozhikode', state_id: 'Kerala' },
      { id: 'Thrissur', name: 'Thrissur', state_id: 'Kerala' },
      { id: 'Kollam', name: 'Kollam', state_id: 'Kerala' },
      { id: 'Kannur', name: 'Kannur', state_id: 'Kerala' }
    ],
    'Madhya Pradesh': [
      { id: 'Indore', name: 'Indore', state_id: 'Madhya Pradesh' },
      { id: 'Bhopal', name: 'Bhopal', state_id: 'Madhya Pradesh' },
      { id: 'Jabalpur', name: 'Jabalpur', state_id: 'Madhya Pradesh' },
      { id: 'Gwalior', name: 'Gwalior', state_id: 'Madhya Pradesh' },
      { id: 'Ujjain', name: 'Ujjain', state_id: 'Madhya Pradesh' },
      { id: 'Sagar', name: 'Sagar', state_id: 'Madhya Pradesh' },
      { id: 'Dewas', name: 'Dewas', state_id: 'Madhya Pradesh' }
    ],
    'Punjab': [
      { id: 'Ludhiana', name: 'Ludhiana', state_id: 'Punjab' },
      { id: 'Amritsar', name: 'Amritsar', state_id: 'Punjab' },
      { id: 'Jalandhar', name: 'Jalandhar', state_id: 'Punjab' },
      { id: 'Patiala', name: 'Patiala', state_id: 'Punjab' },
      { id: 'Bathinda', name: 'Bathinda', state_id: 'Punjab' },
      { id: 'Mohali', name: 'Mohali', state_id: 'Punjab' }
    ],
    'Rajasthan': [
      { id: 'Jaipur', name: 'Jaipur', state_id: 'Rajasthan' },
      { id: 'Jodhpur', name: 'Jodhpur', state_id: 'Rajasthan' },
      { id: 'Kota', name: 'Kota', state_id: 'Rajasthan' },
      { id: 'Bikaner', name: 'Bikaner', state_id: 'Rajasthan' },
      { id: 'Ajmer', name: 'Ajmer', state_id: 'Rajasthan' },
      { id: 'Udaipur', name: 'Udaipur', state_id: 'Rajasthan' }
    ]
  };

  return fallbacks[stateName] || [
    { id: `${stateName} City`, name: `${stateName} City`, state_id: stateName }
  ];
}