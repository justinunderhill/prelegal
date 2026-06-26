"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User } from "@/lib/auth/types";
import * as authClient from "@/lib/auth/client";
import { hydrateDocumentsForUser } from "@/lib/documentHydration";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authClient.getStoredUser());
  const [isLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await authClient.signIn(email, password);
    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    authClient.signOut();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    void hydrateDocumentsForUser(user);
  }, [user]);

  return (
    <AuthContext value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
