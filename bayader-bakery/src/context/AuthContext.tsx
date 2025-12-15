import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCart } from './CartContext';
import * as cartService from '../services/cartService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'staff' | 'driver';
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfile: (userData: Partial<User> & { password?: string }) => Promise<User>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We'll access cart context after it's available
  const cartContextValue = useCart();

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Restore cart on page refresh if user is logged in
        restoreCartOnLogin(storedToken, parsedUser.id);
      } catch (err) {
        console.error('Failed to parse stored user', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to restore cart after login
  const restoreCartOnLogin = async (authToken: string, userId: string) => {
    try {
      console.log('🔄 Restoring cart for user:', userId);
      const savedCart = await cartService.getCart(authToken);
      
      if (savedCart && savedCart.length > 0) {
        console.log('✅ Restored', savedCart.length, 'items from server');
        cartContextValue.setCartItems(savedCart);
      } else {
        console.log('ℹ️ No saved cart found on server');
      }
    } catch (error) {
      console.error('❌ Failed to restore cart:', error);
      // Don't block login if cart restore fails
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data) {
        const { token: newToken, user: newUser } = data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Restore cart from server after successful login
        await restoreCartOnLogin(newToken, newUser.id);
        
        return newUser;
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.data) {
        const { token: newToken, user: newUser } = data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // New user, cart will be empty on server
        // No need to restore cart after registration
        
        return newUser;
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Save cart to server before logging out (if user is logged in and has items)
      if (token && user && cartContextValue.items.length > 0) {
        console.log('💾 Saving cart before logout...', cartContextValue.items.length, 'items');
        try {
          await cartService.saveCart(cartContextValue.items, token);
          console.log('✅ Cart saved successfully');
        } catch (error) {
          console.error('❌ Failed to save cart on logout:', error);
          // Continue with logout even if save fails
        }
      }
    } catch (error) {
      console.error('Error during logout cart save:', error);
    }

    // Clear cart in UI immediately
    console.log('🗑️ Clearing cart UI');
    cartContextValue.clearCart();

    // Clear auth data
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear all cart data from localStorage
    const userId = user?.id;
    if (userId) {
      localStorage.removeItem(`bayader_cart_${userId}`);
    }
    localStorage.removeItem('bayader_cart_guest');
    
    console.log('👋 Logout complete');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateProfile = async (userData: Partial<User> & { password?: string }): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      if (data.success && data.data) {
        const updatedUser = data.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      
      throw new Error('Invalid response from server');
    } catch (err) {
      console.error('Update profile error:', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
