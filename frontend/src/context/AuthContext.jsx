import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/client";

const STORAGE_KEY = "skill-reco-auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { token: "", refreshToken: "", user: null };
  });

  const login = (payload) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: "", refreshToken: "", user: null });
  };

  const refreshSession = async () => {
    if (!auth.refreshToken) return false;
    try {
      const refreshed = await api.refresh({ refreshToken: auth.refreshToken });
      const nextAuth = {
        ...auth,
        token: refreshed.accessToken || refreshed.token,
        refreshToken: refreshed.refreshToken || auth.refreshToken,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const value = useMemo(() => ({ ...auth, login, logout, refreshSession }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
