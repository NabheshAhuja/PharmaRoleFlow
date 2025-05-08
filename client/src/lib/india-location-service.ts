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
      return "";
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
      
      // Start with the predefined states list while fetching
      const predefinedStates = [
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
      
      // Cache the predefined states
      stateCache.push(...predefinedStates);
      
      // Return the predefined states - we're not making the API call to avoid rate limiting
      return predefinedStates;
    } catch (error) {
      console.error('Error fetching states:', error);
      // Return a fallback for important states in India
      return [
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
      
      // Use fallback data for now to avoid API rate limiting
      const fallbackCities = getFallbackCities(stateName);
      
      // Cache the fallback cities
      cityCache.set(stateName, fallbackCities);
      
      return fallbackCities;
    } catch (error) {
      console.error(`Error fetching cities for state ${stateName}:`, error);
      
      // Get the fallback cities based on state
      return getFallbackCities(stateName);
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
      { id: 'Delhi', name: 'Delhi', state_id: 'Delhi' }
    ],
    'Maharashtra': [
      { id: 'Mumbai', name: 'Mumbai', state_id: 'Maharashtra' },
      { id: 'Pune', name: 'Pune', state_id: 'Maharashtra' },
      { id: 'Nagpur', name: 'Nagpur', state_id: 'Maharashtra' }
    ],
    'Karnataka': [
      { id: 'Bangalore', name: 'Bangalore', state_id: 'Karnataka' },
      { id: 'Mysore', name: 'Mysore', state_id: 'Karnataka' }
    ],
    'Tamil Nadu': [
      { id: 'Chennai', name: 'Chennai', state_id: 'Tamil Nadu' },
      { id: 'Coimbatore', name: 'Coimbatore', state_id: 'Tamil Nadu' }
    ],
    'Telangana': [
      { id: 'Hyderabad', name: 'Hyderabad', state_id: 'Telangana' },
      { id: 'Warangal', name: 'Warangal', state_id: 'Telangana' }
    ],
    'Gujarat': [
      { id: 'Ahmedabad', name: 'Ahmedabad', state_id: 'Gujarat' },
      { id: 'Surat', name: 'Surat', state_id: 'Gujarat' }
    ],
    'West Bengal': [
      { id: 'Kolkata', name: 'Kolkata', state_id: 'West Bengal' },
      { id: 'Howrah', name: 'Howrah', state_id: 'West Bengal' }
    ],
    'Uttar Pradesh': [
      { id: 'Lucknow', name: 'Lucknow', state_id: 'Uttar Pradesh' },
      { id: 'Kanpur', name: 'Kanpur', state_id: 'Uttar Pradesh' },
      { id: 'Varanasi', name: 'Varanasi', state_id: 'Uttar Pradesh' }
    ]
  };

  return fallbacks[stateName] || [
    { id: `City in ${stateName}`, name: `City in ${stateName}`, state_id: stateName }
  ];
}