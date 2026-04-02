"use client";

import { BuilderMode } from "@/lib/chat/types";

interface ModeToggleProps {
  mode: BuilderMode;
  onChange: (mode: BuilderMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      <button
        onClick={() => onChange("chat")}
        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "chat"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-brand-gray hover:text-brand-navy"
        }`}
      >
        AI Chat
      </button>
      <button
        onClick={() => onChange("form")}
        className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          mode === "form"
            ? "bg-brand-blue text-white shadow-sm"
            : "text-brand-gray hover:text-brand-navy"
        }`}
      >
        Manual Form
      </button>
    </div>
  );
}
