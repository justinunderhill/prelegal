"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-premium-muted">
      <header className="sticky top-0 z-30 border-b border-premium-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:max-w-7xl sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy shadow-sm ring-1 ring-white/10">
              <svg
                className="h-4.5 w-4.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-navy">PreLegal</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/agreements"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-gray transition-colors hover:bg-premium-warm hover:text-brand-navy"
            >
              Templates
            </Link>
            <Link
              href="/documents"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-gray transition-colors hover:bg-premium-warm hover:text-brand-navy"
            >
              Documents
            </Link>
            {user && (
              <>
                <span className="hidden max-w-48 truncate rounded-lg border border-premium-line bg-white px-3 py-1.5 text-sm text-brand-gray sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-gray transition-colors hover:bg-white hover:text-brand-navy"
                >
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
