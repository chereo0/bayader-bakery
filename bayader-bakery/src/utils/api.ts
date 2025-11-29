// API Service Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image?: string;
  stock: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationData;
}

// Products API
export const productApi = {
  // Get all products with filters
  getProducts: async (
    params?: {
      category?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
      status?: string;
    }
  ): Promise<ApiResponse<ProductsResponse>> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);

      const url = `${API_BASE_URL}/products?${queryParams.toString()}`;
      console.log('📡 Fetching products from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📋 Response headers:', {
        'Content-Type': response.headers.get('Content-Type'),
        'Content-Length': response.headers.get('Content-Length'),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API returned data:', data);
      console.log('📦 Data structure:', {
        success: data.success,
        hasData: !!data.data,
        hasProducts: !!data.data?.products,
        productCount: data.data?.products?.length,
        pagination: data.data?.pagination,
      });
      return data;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      };
    }
  },

  // Get single product
  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product',
      };
    }
  },

  // Get product categories
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return ['Cakes', 'Pastries', 'Breads', 'Cookies', 'Custom Orders', 'Seasonal'];
      }

      const data = await response.json();
      return data.data || ['Cakes', 'Pastries', 'Breads', 'Cookies', 'Custom Orders', 'Seasonal'];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return ['Cakes', 'Pastries', 'Breads', 'Cookies', 'Custom Orders', 'Seasonal'];
    }
  },
};

export default productApi;
