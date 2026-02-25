import axios from 'axios';

const API_URL = "http://localhost:8000/companies/";

class CompanyService {
  // Get all companies
  async getAll() {
    const response = await axios.get(API_URL);
    return response.data;
  }

  // Create a new company
  async create(data) {
    const response = await axios.post(API_URL, data);
    return response.data;
  }

  // Edit an existing company (using PATCH for partial updates)
  async update(id, data) {
    const response = await axios.patch(`${API_URL}${id}`, data);
    return response.data;
  }

  // Delete a company
  async delete(id) {
    const response = await axios.delete(`${API_URL}${id}`);
    return response.data;
  }

  // Get a single company by ID
  async get(id) {
    const response = await axios.get(`${API_URL}${id}`);
    return response.data;
  }
}

export default new CompanyService();
