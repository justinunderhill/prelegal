"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/chat/api";
import { ChatMessage } from "@/lib/chat/types";

interface UseChatSessionOptions {
  slug: string;
  agreementName: string;
  onFieldsExtracted: (fields: Record<string, unknown>) => void;
}

export function useChatSession({ slug, agreementName, onFieldsExtracted }: UseChatSessionOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetCount, setResetCount] = useState(0);
  const hasInitialized = useRef(false);

  // Keep callback ref stable to avoid re-triggering effects
  const onFieldsExtractedRef = useRef(onFieldsExtracted);
  useEffect(() => {
    onFieldsExtractedRef.current = onFieldsExtracted;
  });

  const initialMessage = `Hello, I'd like to create a ${agreementName}.`;

  // Send initial greeting on mount or reset
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    setIsLoading(true);
    sendChatMessage({
      slug,
      history: [],
      user_message: initialMessage,
    })
      .then((response) => {
        setMessages([
          { role: "user", content: initialMessage },
          { role: "assistant", content: response.assistant_message },
        ]);
        if (Object.keys(response.extracted_fields).length > 0) {
          onFieldsExtractedRef.current(nestPartyFields(response.extracted_fields));
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug, initialMessage, resetCount]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", content: text };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage({
          slug,
          history: messages, // send previous history (before this message)
          user_message: text,
        });

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: response.assistant_message,
        };
        setMessages([...updatedMessages, assistantMsg]);

        if (Object.keys(response.extracted_fields).length > 0) {
          onFieldsExtractedRef.current(nestPartyFields(response.extracted_fields));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [slug, messages]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    hasInitialized.current = false;
    setResetCount((c) => c + 1);
  }, []);

  return { messages, sendMessage, isLoading, error, reset };
}

/**
 * Convert flat party field names (party1_name, party2_company, etc.)
 * into nested objects matching the form shape ({ party1: { name, ... } }).
 */
function nestPartyFields(
  fields: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const party1: Record<string, string> = {};
  const party2: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (key.startsWith("party1_")) {
      party1[key.replace("party1_", "")] = value;
    } else if (key.startsWith("party2_")) {
      party2[key.replace("party2_", "")] = value;
    } else {
      result[key] = value;
    }
  }

  if (Object.keys(party1).length > 0) {
    result.party1 = party1;
  }
  if (Object.keys(party2).length > 0) {
    result.party2 = party2;
  }

  return result;
}
