import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("realestate_token");
    const savedUser = localStorage.getItem("realestate_user");
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("realestate_token");
        localStorage.removeItem("realestate_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("realestate_token", data.access_token);
    const userInfo = {
      id: data.user_id,
      email: data.email,
      fullName: data.full_name,
      role: data.role
    };
    localStorage.setItem("realestate_user", JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem("realestate_token", data.access_token);
    const userInfo = {
      id: data.user_id,
      email: data.email,
      fullName: data.full_name,
      role: data.role
    };
    localStorage.setItem("realestate_user", JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  };

  const demoLogin = async (role) => {
    const credentials = {
      buyer: { email: "buyer@realestate.ai", password: "Buyer@12345" },
      seller: { email: "seller@realestate.ai", password: "Seller@12345" },
      admin: { email: "admin@realestate.ai", password: "Admin@12345" }
    };
    const cred = credentials[role] || credentials.buyer;
    return login(cred.email, cred.password);
  };

  const logout = () => {
    localStorage.removeItem("realestate_token");
    localStorage.removeItem("realestate_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
