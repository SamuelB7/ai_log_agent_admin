import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AuthResponse, User, loginRequest, logoutRequest } from "@/lib/api";

const storageKey = "debugops.auth";

interface StoredAuth {
  token: string;
  user: User;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth?.token ?? null,
      user: auth?.user ?? null,
      isAuthenticated: Boolean(auth?.token),
      login: async (email: string, password: string) => {
        const response: AuthResponse = await loginRequest(email, password);
        const nextAuth = {
          token: response.accessToken,
          user: response.user
        };
        localStorage.setItem(storageKey, JSON.stringify(nextAuth));
        setAuth(nextAuth);
      },
      logout: async () => {
        const currentToken = auth?.token;
        localStorage.removeItem(storageKey);
        setAuth(null);

        if (currentToken) {
          try {
            await logoutRequest(currentToken);
          } catch {
            // Local logout must still clear the UI when the backend is unavailable.
          }
        }
      }
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    return parsed?.token && parsed?.user ? parsed : null;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
}
