import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage on app load
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Ensure token is always available in user object
        if (storedToken && !userData.token) {
          userData.token = storedToken;
        }
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Ensure token is included in userData
    const userWithToken = {
      ...userData,
      token: token || userData.token
    };
    setUser(userWithToken);
    localStorage.setItem("user", JSON.stringify(userWithToken));
    localStorage.setItem("token", token || userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
