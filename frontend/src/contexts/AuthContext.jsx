import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, settingsAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { canAccessPage, canAccessTab, canDoAction } from '../utils/permissionUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/**
 * Decode JWT token to check expiry
 * @param {string} token - JWT token
 * @returns {boolean} - true if token is valid and not expired
 */
const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);

    // Check if token is expired (with 5 second buffer)
    return exp * 1000 > Date.now() + 5000;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rbacMatrix, setRbacMatrix] = useState({});

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Validate token exists and is not expired
      if (token && storedUser && isTokenValid(token)) {
        try {
          // Verify token with backend
          const response = await authAPI.getMe();
          setUser(response.data.data);

          // Update stored user if different
          if (JSON.stringify(response.data.data) !== storedUser) {
            localStorage.setItem('user', JSON.stringify(response.data.data));
          }
        } catch (error) {
          // Token is invalid or expired
          console.error('Token verification failed:', error);
          clearAuth();
        }
      } else {
        // Token is expired or doesn't exist
        clearAuth();
      }

      setLoading(false);
    };

    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getAll();
        if (res.data.data.rbac_matrix) {
          setRbacMatrix(res.data.data.rbac_matrix);
        }
      } catch (err) {
        console.error("Failed to fetch system settings", err);
      }
    };

    initializeAuth();
    fetchSettings();
  }, []);

  // Clear authentication
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      // Handle different response structures
      const data = response.data;
      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token) {
        throw new Error('No token received');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      // Sanitize input
      const sanitizedName = name.trim();
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedPassword = password.trim();

      if (!sanitizedName || !sanitizedEmail || !sanitizedPassword) {
        toast.error('All fields are required');
        return;
      }

      if (sanitizedPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }

      const response = await authAPI.register({
        name: sanitizedName,
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      const { token, user } = response.data;

      // Validate response
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return response.data;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    clearAuth();
    toast.success('Logged out successfully');
  };

  // Update user profile in context
  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateUserInContext,
    isAuthenticated: !!user,
    hasRole: (role) => {
      if (!user) return false;
      if (user.role === 'admin') return true; // Admin has all roles implicitly
      if (Array.isArray(role)) return role.includes(user.role);
      return user.role === role;
    },
    hasPermission: (permission) => {
      if (!user) return false;
      if (user.role === 'admin' || user.role === 'Administrator') return true;
      return user.permissions && user.permissions[permission] === true;
    },
    canAccessPage: (pageKey) => canAccessPage(user, rbacMatrix, pageKey),
    canAccessTab: (pageKey, tabKey) => canAccessTab(user, rbacMatrix, pageKey, tabKey),
    canDoAction: (pageKey, tabKey, actionKey, actionContext = null) => canDoAction(user, rbacMatrix, pageKey, tabKey, actionKey, actionContext),
    refreshSettings: async () => {
      const res = await settingsAPI.getAll();
      if (res.data.data.rbac_matrix) {
        setRbacMatrix(res.data.data.rbac_matrix);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
