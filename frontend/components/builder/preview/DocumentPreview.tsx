"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { renderFullDocument } from "@/lib/templates/engine";

// Extend default sanitization schema to allow <span class="...">
// which is used in the standard terms template, while blocking all other
// potentially dangerous HTML from user input. Also explicitly allow the
// task-list checkbox attributes that remark-gfm emits.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span || []), "className"],
    input: [...(defaultSchema.attributes?.input || []), "type", "checked", "disabled"],
  },
  tagNames: [...(defaultSchema.tagNames || []), "span", "label", "input"],
};

interface DocumentPreviewProps {
  coverMarkdown: string;
  termsTemplate: string;
  fieldMap: Record<string, string>;
}

export function DocumentPreview({
  coverMarkdown,
  termsTemplate,
  fieldMap,
}: DocumentPreviewProps) {
  const rendered = useMemo(() => {
    if (!termsTemplate) return "";
    return renderFullDocument(coverMarkdown, termsTemplate, fieldMap);
  }, [coverMarkdown, termsTemplate, fieldMap]);

  if (!rendered) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading document preview...
      </div>
    );
  }

  return (
    <div className="prose prose-slate prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
      >
        {rendered}
      </ReactMarkdown>
    </div>
  );
}
