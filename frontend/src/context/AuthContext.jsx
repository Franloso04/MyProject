import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedOrg = localStorage.getItem("organization");

    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedOrg) setOrganization(JSON.parse(savedOrg));

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiRequest("auth/login.php", "POST", {
      email,
      password,
    });

    // esperado del backend PHP:
    // { token: "...", user: {...}, organization: {...} }

    if (!data.token || !data.organization) {
      throw new Error("Respuesta inválida del servidor");
    }

    setToken(data.token);
    setUser(data.user || null);
    setOrganization(data.organization);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user || {}));
    localStorage.setItem("organization", JSON.stringify(data.organization));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrganization(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("organization");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        organization,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
