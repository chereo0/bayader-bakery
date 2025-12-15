import { CartItem } from '../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CartResponse {
  success: boolean;
  data?: {
    items: Array<{
      productId: string;
      name: string;
      price: number;
      image?: string;
      quantity: number;
    }>;
    updatedAt?: string;
  };
  message?: string;
  error?: string;
}

/**
 * Fetch saved cart from backend
 */
export const getCart = async (token: string): Promise<CartItem[]> => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch cart');
    }

    if (data.success && data.data?.items) {
      // Transform backend format to frontend format
      return data.data.items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity
      }));
    }

    return [];
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    throw error;
  }
};

/**
 * Save cart to backend
 */
export const saveCart = async (items: CartItem[], token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/cart/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items })
    });

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save cart');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to save cart');
    }
  } catch (error) {
    console.error('❌ Error saving cart:', error);
    throw error;
  }
};

/**
 * Clear cart on backend
 */
export const clearCartOnServer = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/cart/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data: CartResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to clear cart');
    }

    if (!data.success) {
      throw new Error(data.message || 'Failed to clear cart');
    }
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    throw error;
  }
};
