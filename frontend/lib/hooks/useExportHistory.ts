"use client";

import { useSyncExternalStore } from "react";
import {
  getExportsSnapshot,
  getServerExportsSnapshot,
  subscribeToExports,
} from "@/lib/exportHistory";

export function useExportHistory() {
  return useSyncExternalStore(
    subscribeToExports,
    getExportsSnapshot,
    getServerExportsSnapshot
  );
}
