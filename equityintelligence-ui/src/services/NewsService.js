import axios from 'axios';

const API_URL = "http://localhost:8000/news/";

class NewsService {
  // Get all news events
  async getAll() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  // Create a new news event
  async create(data) {
    const response = await axios.post(API_URL, data);
    return response.data;
  }
}

export default new NewsService();
