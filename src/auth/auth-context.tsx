import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { fetchMe, login as apiLogin, register as apiRegister } from "@/src/api/auth";
import { LoginRequest, RegisterRequest, UserProfileResponse } from "@/src/api/types";
import { clearToken, getToken, saveToken } from "@/src/auth/token-storage";
import { hasCompletedOnboarding, markOnboardingComplete } from "@/src/storage/onboarding-storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: UserProfileResponse | null;
  isGuest: boolean;
  hasOnboarded: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    async function bootstrap() {
      const [token, onboarded] = await Promise.all([
        getToken(),
        hasCompletedOnboarding(),
      ]);
      setHasOnboarded(onboarded);
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
    queryClient.clear();
    setUser(me);
    setStatus("authenticated");
  }, [queryClient]);

  const register = useCallback(async (data: RegisterRequest) => {
    const auth = await apiRegister(data);
    await saveToken(auth.token);
    const me = await fetchMe();
    queryClient.clear();
    setUser(me);
    setStatus("authenticated");
  }, [queryClient]);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
  }, []);

  const continueAsGuest = useCallback(() => {
    setUser(null);
    setStatus("guest");
  }, []);

  const exitGuestMode = useCallback(() => {
    setStatus("unauthenticated");
  }, []);

  const completeOnboarding = useCallback(async () => {
    await markOnboardingComplete();
    setHasOnboarded(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isGuest: status === "guest",
        hasOnboarded,
        login,
        register,
        logout,
        refreshUser,
        continueAsGuest,
        exitGuestMode,
        completeOnboarding,
      }}
    >
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
