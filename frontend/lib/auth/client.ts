import { User } from "./types";

const STORAGE_KEY = "prelegal_user";
export const AUTH_CHANGED_EVENT = "prelegal:auth-changed";

type RuntimeLocation = Pick<Location, "hostname" | "port">;

class AuthApiError extends Error {
  constructor(public status: number) {
    super(`Auth API error (${status})`);
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getApiBaseUrl(location?: RuntimeLocation): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const runtimeLocation =
    location ?? (typeof window !== "undefined" ? window.location : undefined);

  if (runtimeLocation) {
    const { hostname, port } = runtimeLocation;
    const isLocalFrontend =
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      (port === "3000" || port === "3001");

    if (isLocalFrontend) {
      return "http://localhost:8000";
    }
  }

  return "";
}

function getAuthApiUrl(path: string): string {
  return `${getApiBaseUrl()}/api/auth/${path}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getLocalUserId(email: string): string {
  return `local:${normalizeEmail(email).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

function storeUser(user: User): User {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  notifyAuthChanged();
  return user;
}

function localSignIn(email: string): User {
  const normalizedEmail = normalizeEmail(email);
  const user: User = { id: getLocalUserId(normalizedEmail), email: normalizedEmail };
  return storeUser(user);
}

async function requestAuth(path: "signin" | "signup", email: string, password: string): Promise<User> {
  if (typeof fetch === "undefined") {
    throw new TypeError("Auth API unavailable.");
  }

  const response = await fetch(getAuthApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new AuthApiError(response.status);
  }

  return response.json();
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const user = await requestAuth("signin", email, password);
    return storeUser(user);
  } catch (error) {
    if (error instanceof TypeError) {
      return localSignIn(email);
    }
    if (!(error instanceof AuthApiError) || error.status !== 401) {
      throw error;
    }
  }

  try {
    const user = await requestAuth("signup", email, password);
    return storeUser(user);
  } catch (error) {
    if (error instanceof TypeError) {
      return localSignIn(email);
    }
    throw error;
  }
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyAuthChanged();
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

export function getActiveOwner(): Pick<User, "id" | "email"> {
  return getStoredUser() ?? { id: "anonymous", email: "local browser" };
}

export function subscribeToAuthChanges(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(AUTH_CHANGED_EVENT, onStoreChange);
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, onStoreChange);
}
