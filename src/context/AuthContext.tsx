import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEMO_ACCOUNTS } from "@/lib/seed";
import type { Role, User } from "@/lib/types";

const STORAGE_KEY = "jsip.session";

/**
 * Session shape mirrors the Express `/api/v1/auth/login` response
 * ({ token, user }). Here the token is a locally signed demo token; in the
 * reference backend it is a real JWT verified by middleware/auth.js.
 */
interface Session {
  token: string;
  user: User;
}

interface AuthValue {
  ready: boolean;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (role: Role) => boolean;
  homeFor: (role: Role) => string;
}

const AuthContext = createContext<AuthValue | null>(null);

export const ROLE_HOME: Record<Role, string> = {
  CITIZEN: "/citizen",
  ADMIN: "/admin",
  UNIVERSITY: "/university",
  INDUSTRY: "/industry",
};

export const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "Citizen",
  ADMIN: "Government",
  UNIVERSITY: "University",
  INDUSTRY: "Industry",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const match = DEMO_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!match) throw new Error("Invalid email or password.");
    const next: Session = { token: `demo.${btoa(match.user.email)}.token`, user: match.user };
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return match.user;
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
      hasRole: (role) => session?.user.role === role,
      homeFor: (role) => ROLE_HOME[role],
    }),
    [ready, session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
