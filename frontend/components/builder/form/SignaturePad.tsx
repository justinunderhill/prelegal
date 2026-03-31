"use client";

import { useRef, useCallback } from "react";
import ReactSignatureCanvas from "react-signature-canvas";

interface SignaturePadProps {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
}

export function SignaturePad({ label, value, onChange }: SignaturePadProps) {
  const sigRef = useRef<ReactSignatureCanvas>(null);

  const handleEnd = useCallback(() => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      onChange(sigRef.current.toDataURL("image/png"));
    }
  }, [onChange]);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-1 transition-colors focus-within:border-slate-400">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Signature"
              className="h-[120px] w-full object-contain"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-red-600"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="relative">
            <ReactSignatureCanvas
              ref={sigRef}
              canvasProps={{
                className: "w-full h-[120px] cursor-crosshair",
              }}
              penColor="#1e293b"
              minWidth={1.5}
              maxWidth={2.5}
              onEnd={handleEnd}
            />
            <span className="pointer-events-none absolute bottom-3 left-3 text-xs text-slate-400">
              Draw signature here
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-white hover:text-red-600"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
