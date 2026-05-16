import api from './api';

class HomeApi {
  async request(url, options = {}) {
    try {
      const response = await api({
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
    // Add /api prefix if not using the api service's default (which we removed /api from)
    return this.get('/api/homepage', { params });
  }
}

const homeApi = new HomeApi();
export default homeApi;
