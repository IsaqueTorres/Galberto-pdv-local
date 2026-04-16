import { createContext, useContext, useState, ReactNode } from "react";
import { login as loginService } from "../services/auth.service";
import { Usuario } from "../types/Usuario";

type AuthContextType = {
  usuario: Usuario | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "galberto_user_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);



  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const user = await loginService(username, password);
      if (user) {
        setUsuario(user);
        localStorage.setItem(STORAGE_KEY, String(user.id));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Erro no login:", err);
      return false;
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
