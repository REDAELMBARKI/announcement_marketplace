import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

class HomeApi {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async request(url, options = {}) {
    try {
      const response = await this.api({
        url,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  async get(url, options = {}) {
    return this.request(url, {
      method: 'GET',
      ...options,
    });
  }

  // Homepage specific methods
  async getHomepageData(params = {}) {
    return this.get('/api/homepage', params);
  }
}

const homeApi = new HomeApi();
export default homeApi;
