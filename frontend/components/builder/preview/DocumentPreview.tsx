"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { renderFullDocument } from "@/lib/templates/engine";

// Extend default sanitization schema to allow <span class="coverpage_link">
// which is used in the standard terms template, while blocking all other
// potentially dangerous HTML from user input.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "className"],
  },
  tagNames: [...(defaultSchema.tagNames || []), "span", "label"],
};

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
      <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}>
        {rendered}
      </ReactMarkdown>
    </div>
  );
}
