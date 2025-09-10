import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, name, email, phone, address }
    const navigate = useNavigate();
  // Load from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);
   
const updateProfile = async ({ name, phone, address, email, currentPassword, newPassword }) => {
  if (!user?.id) throw new Error("Not logged in");
  const { data } = await axios.patch(`/users/${user.id}`, {
    name,
    phone,
    address,
    email,
    currentPassword,
    newPassword,
  });
  setUser(data);
  return data;
};

 


  // ---- API calls ----
  const signup = async ({ name, email, password, phone, address }) => {
    const res = await axios.post("/auth/signup", { name, email, password, phone, address });
    setUser(res.data); // auto-login after signup
  };
   
   

  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    setUser(res.data);
  };

  const logout = () => {
    navigate("/", { replace: true });
    setUser(null);
             
  };

  return (
    <AuthCtx.Provider value={{ user, signup, login, logout,updateProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
