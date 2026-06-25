"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useChatSession } from "@/lib/hooks/useChatSession";
import { getAgreementConfig } from "@/lib/agreements";
import { saveDraft } from "@/lib/drafts";
import { buildPrefilledDraftValues, countPrefillFields } from "@/lib/draftPrefill";

export function IntakeChat() {
  const router = useRouter();
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<Record<string, unknown>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeenMessageCount, setLastSeenMessageCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleFieldsExtracted = useCallback(
    (fields: Record<string, unknown>) => {
      setExtractedFields((current) => ({ ...current, ...fields }));
      if (fields.suggested_slug && typeof fields.suggested_slug === "string") {
        setSuggestedSlug(fields.suggested_slug);
      }
    },
    []
  );

  const { messages, sendMessage, isLoading, error } = useChatSession({
    slug: "intake",
    agreementName: "legal document",
    onFieldsExtracted: handleFieldsExtracted,
  });

  const [input, setInput] = useState("");

  // Scroll to bottom within the chat panel only (no page jump)
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading, isOpen]);

  const hasUnread = !isOpen && messages.length > lastSeenMessageCount;

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartBuilding = () => {
    if (suggestedSlug) {
      const config = getAgreementConfig(suggestedSlug);
      if (config) {
        saveDraft({
          slug: config.slug,
          agreementName: config.name,
          values: buildPrefilledDraftValues(config, extractedFields),
        });
      }
      router.push(`/agreements/${suggestedSlug}/`);
    }
  };

  const suggestedConfig = suggestedSlug ? getAgreementConfig(suggestedSlug) : undefined;
  const prefillCount = suggestedConfig
    ? countPrefillFields(suggestedConfig, extractedFields)
    : 0;

  const toggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) setLastSeenMessageCount(messages.length);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Chat panel */}
      <div
        ref={panelRef}
        className={`origin-bottom-right transition-all duration-200 ease-out ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-[min(28rem,80vh)] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:h-[32rem] sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-purple shadow-sm">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">AI Assistant</h3>
                <p className="text-xs text-brand-gray">Find the right document</p>
              </div>
            </div>
            <button
              onClick={toggleOpen}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close chat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3.5 py-2">
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested action */}
          {suggestedSlug && (
            <div className="border-t border-gray-100 bg-green-50 px-4 py-3">
              <div className="mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-800">
                  Recommended document
                </p>
                <p className="mt-0.5 text-sm font-semibold text-brand-navy">
                  {suggestedConfig?.name ?? "Suggested agreement"}
                </p>
                {prefillCount > 0 && (
                  <p className="mt-1 text-xs text-green-800">
                    {prefillCount} field{prefillCount === 1 ? "" : "s"} will be prefilled from this conversation.
                  </p>
                )}
              </div>
              <button
                onClick={handleStartBuilding}
                className="w-full rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-purple/90"
              >
                {prefillCount > 0 ? "Continue with prefilled draft" : "Start building this document"}
              </button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 px-3 py-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe what you need..."
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition-colors focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-blue disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-brand-purple px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={toggleOpen}
        className={`group relative flex h-14 items-center justify-center gap-2 rounded-full text-white shadow-lg transition-all duration-200 active:scale-95 ${
          isOpen
            ? "w-14 bg-gray-700 hover:bg-gray-800 hover:shadow-xl"
            : "bg-gradient-to-br from-brand-blue to-brand-purple px-5 shadow-brand-purple/40 hover:scale-105 hover:shadow-xl hover:shadow-brand-purple/50"
        }`}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? (
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg
              className="h-6 w-6 shrink-0 text-white drop-shadow-sm transition-transform duration-300 group-hover:rotate-[18deg]"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            <span className="whitespace-nowrap text-sm font-semibold tracking-tight">Ask AI</span>
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-yellow opacity-75" />
                <span className="relative inline-flex h-4 w-4 rounded-full bg-brand-yellow ring-2 ring-white" />
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
