import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { fetchMe, login as apiLogin, register as apiRegister } from "@/src/api/auth";
import { LoginRequest, RegisterRequest, UserProfileResponse } from "@/src/api/types";
import { clearToken, getToken, saveToken } from "@/src/auth/token-storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfileResponse | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    async function bootstrap() {
      const token = await getToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
        setStatus("authenticated");
      } catch {
        await clearToken();
        setStatus("unauthenticated");
      }
    }
    bootstrap();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const auth = await apiLogin(data);
    await saveToken(auth.token);
    const me = await fetchMe();
    setUser(me);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const auth = await apiRegister(data);
    await saveToken(auth.token);
    const me = await fetchMe();
    setUser(me);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
