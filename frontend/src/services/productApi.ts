const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ProductApi {
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

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Product specific methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.get(endpoint);
  }

  async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  async getPopularProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products/popular?${queryString}` : '/products/popular';
    return this.get(endpoint);
  }

  async getNewArrivals(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products/new?${queryString}` : '/products/new';
    return this.get(endpoint);
  }

  async getDonationProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products/donations?${queryString}` : '/products/donations';
    return this.get(endpoint);
  }
}

const productApi = new ProductApi();
export default productApi;
