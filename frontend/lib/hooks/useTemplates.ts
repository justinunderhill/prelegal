"use client";

import { useState, useEffect } from "react";

/**
 * Hook to fetch template markdown files.
 * When coverUrl is null, only the terms template is fetched (the cover page
 * is generated programmatically by the agreement config).
 */
export function useTemplates(coverUrl: string | null, termsUrl: string) {
  const [cover, setCover] = useState("");
  const [terms, setTerms] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetches: Promise<string>[] = [];

    if (coverUrl) {
      fetches.push(
        fetch(coverUrl).then((r) => {
          if (!r.ok) throw new Error(`Failed to load ${coverUrl}`);
          return r.text();
        })
      );
    } else {
      fetches.push(Promise.resolve(""));
    }

    fetches.push(
      fetch(termsUrl).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${termsUrl}`);
        return r.text();
      })
    );

    Promise.all(fetches)
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
