"use client";

import { useState, useEffect } from "react";

/**
 * Hook to fetch template markdown files.
 * Returns coverTemplate, termsTemplate strings (empty until loaded),
 * and an error flag if the fetch fails.
 */
export function useTemplates(coverUrl: string, termsUrl: string) {
  const [cover, setCover] = useState("");
  const [terms, setTerms] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(coverUrl).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${coverUrl}`);
        return r.text();
      }),
      fetch(termsUrl).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${termsUrl}`);
        return r.text();
      }),
    ])
      .then(([c, t]) => {
        if (cancelled) return;
        setCover(c);
        setTerms(t);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load templates");
      });
    return () => {
      cancelled = true;
    };
  }, [coverUrl, termsUrl]);

  return { coverTemplate: cover, termsTemplate: terms, error };
}
