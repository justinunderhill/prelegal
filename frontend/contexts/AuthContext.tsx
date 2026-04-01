"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "@/lib/auth/types";
import * as authClient from "@/lib/auth/client";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(authClient.getStoredUser());
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, _password: string) => {
    const user = authClient.signIn(email);
    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    authClient.signOut();
    setUser(null);
  }, []);

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
