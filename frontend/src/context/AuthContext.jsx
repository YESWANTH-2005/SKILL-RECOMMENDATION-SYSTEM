import { createContext, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "skill-reco-auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { token: "", user: null };
  });

  const login = (payload) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setAuth(payload);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: "", user: null });
  };

  const value = useMemo(() => ({ ...auth, login, logout }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
