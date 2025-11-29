import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
  role: 'staff';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  department?: 'Production' | 'Delivery' | 'Quality Control' | 'Management';
  password?: string;
}

const getAuthToken = () => localStorage.getItem('token');

const getHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});

export const staffService = {
  // List all staff members
  async listStaff(page = 1, limit = 20, search?: string, department?: string) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search && { search }),
      ...(department && { department })
    });

    const response = await axios.get(
      `${API_BASE_URL}/admin/staff?${params}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  // Get single staff member
  async getStaff(id: string) {
    const response = await axios.get(
      `${API_BASE_URL}/admin/staff/${id}`,
      { headers: getHeaders() }
    );
    return response.data;
  },

  // Create new staff member
  async createStaff(payload: CreateStaffPayload) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/staff`,
      payload,
      { headers: getHeaders() }
    );
    return response.data;
  },

  // Update staff member
  async updateStaff(id: string, payload: UpdateStaffPayload) {
    const response = await axios.put(
      `${API_BASE_URL}/admin/staff/${id}`,
      payload,
      { headers: getHeaders() }
    );
    return response.data;
  },

  // Delete staff member
  async deleteStaff(id: string) {
    const response = await axios.delete(
      `${API_BASE_URL}/admin/staff/${id}`,
      { headers: getHeaders() }
    );
    return response.data;
  }
};
