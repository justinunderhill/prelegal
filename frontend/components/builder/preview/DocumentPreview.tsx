"use client";

import { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { renderFullDocument } from "@/lib/templates/engine";

interface DocumentPreviewProps {
  coverTemplate: string;
  termsTemplate: string;
  values: Record<string, unknown>;
}

export function DocumentPreview({
  coverTemplate,
  termsTemplate,
  values,
}: DocumentPreviewProps) {
  const rendered = useMemo(() => {
    if (!coverTemplate || !termsTemplate) return "";
    return renderFullDocument(coverTemplate, termsTemplate, values);
  }, [coverTemplate, termsTemplate, values]);

  if (!rendered) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading document preview...
      </div>
    );
  }

  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{rendered}</ReactMarkdown>
    </div>
  );
}

/**
 * Hook to fetch template markdown files.
 * Returns [coverTemplate, termsTemplate] strings, empty until loaded.
 */
export function useTemplates(coverUrl: string, termsUrl: string) {
  const [cover, setCover] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(coverUrl).then((r) => r.text()),
      fetch(termsUrl).then((r) => r.text()),
    ]).then(([c, t]) => {
      if (cancelled) return;
      setCover(c);
      setTerms(t);
    });
    return () => {
      cancelled = true;
    };
  }, [coverUrl, termsUrl]);

  return { coverTemplate: cover, termsTemplate: terms };
}
