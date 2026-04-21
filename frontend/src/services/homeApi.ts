const API_BASE_URL = 'http://127.0.0.1:8000/api';

class HomeApi {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  // Homepage specific methods
  async getHomepageData(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/homepage?${queryString}` : '/homepage';
    return this.get(endpoint);
  }
}

const homeApi = new HomeApi();
export default homeApi;
