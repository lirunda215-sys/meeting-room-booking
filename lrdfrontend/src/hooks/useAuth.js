import { useState, useEffect, createContext, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      const userData = {
        id: response.id,
        username: response.username,
        name: response.name,
        email: response.email,
        role: response.role
      };
      const authToken = response.accessToken;

      setUser(userData);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', authToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (credentials) => {
    try {
      const response = await api.auth.register(credentials);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAdmin = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}