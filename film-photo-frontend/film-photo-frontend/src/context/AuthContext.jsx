import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as authApi from "../api/auth";
import * as usersApi from "../api/users";
import { getToken, setToken as persistToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, role, phone }
  const [status, setStatus] = useState("loading"); // loading | ready

  const loadProfile = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStatus("ready");
      return;
    }
    try {
      const me = await usersApi.getMe();
      setUser(me);
    } catch {
      persistToken(null);
      setUser(null);
    } finally {
      setStatus("ready");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function login({ email, password }) {
    const res = await authApi.login({ email, password });
    persistToken(res.token);
    await loadProfile();
    return res;
  }

  async function register({ name, email, password, role }) {
    return authApi.register({ name, email, password, role });
  }

  function logout() {
    persistToken(null);
    setUser(null);
  }

  async function refreshProfile() {
    await loadProfile();
  }

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthenticated: !!user, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
