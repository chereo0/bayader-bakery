import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface Material {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  isActive: boolean;
  description?: string;
  supplier?: string;
  unitPrice?: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialData {
  name: string;
  unit: string;
  currentStock?: number;
  reorderLevel?: number;
  description?: string;
  supplier?: string;
  unitPrice?: number;
}

export interface UpdateMaterialData extends Partial<CreateMaterialData> {
  isActive?: boolean;
}

export interface MaterialsResponse {
  success: boolean;
  data: {
    materials: Material[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface MaterialResponse {
  success: boolean;
  data: Material;
}

export interface LowStockMaterialsResponse {
  success: boolean;
  data: Material[];
}

class MaterialService {
  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getMaterials(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<MaterialsResponse> {
    const response = await axios.get(`${API_BASE_URL}/materials`, {
      headers: this.getAuthHeaders(),
      params,
    });
    return response.data;
  }

  async getMaterial(id: string): Promise<MaterialResponse> {
    const response = await axios.get(`${API_BASE_URL}/materials/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async createMaterial(data: CreateMaterialData): Promise<MaterialResponse> {
    const response = await axios.post(`${API_BASE_URL}/materials`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async updateMaterial(id: string, data: UpdateMaterialData): Promise<MaterialResponse> {
    const response = await axios.put(`${API_BASE_URL}/materials/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async deleteMaterial(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${API_BASE_URL}/materials/${id}`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getLowStockMaterials(limit = 5): Promise<LowStockMaterialsResponse> {
    const response = await axios.get(`${API_BASE_URL}/materials/low-stock`, {
      headers: this.getAuthHeaders(),
      params: { limit },
    });
    return response.data;
  }

  async adjustMaterialStock(id: string, adjustment: number, reason?: string): Promise<MaterialResponse> {
    const response = await axios.patch(`${API_BASE_URL}/materials/${id}/adjust-stock`, 
      { adjustment, reason },
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }
}

export const materialService = new MaterialService();