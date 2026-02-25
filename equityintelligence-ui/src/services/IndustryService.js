import axios from 'axios';

const API_URL = "http://localhost:8000/industries/";

class IndustryService {
  // Get all industries
  async getAll() {
    const response = await axios.get(API_URL);
    console.log(response.data);
    return response.data;
  }

  // Create a new industry
  async create(data) {
    const response = await axios.post(API_URL, data);
    return response.data;
  }

  // Edit an existing industry (using PATCH for partial updates)
  async update(id, data) {
    const response = await axios.patch(`${API_URL}${id}`, data);
    return response.data;
  }

  // Delete an industry
  async delete(id) {
    const response = await axios.delete(`${API_URL}${id}`);
    return response.data;
  }
}

export default new IndustryService();