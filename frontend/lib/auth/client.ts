import { User } from "./types";

const STORAGE_KEY = "prelegal_user";

export function signIn(email: string): User {
  const user: User = { id: crypto.randomUUID(), email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}
