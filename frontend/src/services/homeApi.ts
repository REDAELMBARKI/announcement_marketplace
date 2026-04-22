import axios from 'axios';
import route from '../utils/route';

class HomeApi {
  constructor() {
    this.api = axios.create({
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async request(routeName, params = {}, options = {}) {
    try {
      const url = route(routeName, params).toString();
      const response = await this.api({
        url,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(`API request failed for ${routeName}:`, error);
      throw error;
    }
  }

  async get(routeName, params = {}, options = {}) {
    return this.request(routeName, params, {
      method: 'GET',
      ...options,
    });
  }

  // Homepage specific methods
  async getHomepageData(params = {}) {
    return this.get('homepage', params);
  }
}

const homeApi = new HomeApi();
export default homeApi;
