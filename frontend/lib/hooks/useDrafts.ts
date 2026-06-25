"use client";

import { useSyncExternalStore } from "react";
import {
  getDraftsSnapshot,
  getServerDraftsSnapshot,
  subscribeToDrafts,
} from "@/lib/drafts";

export function useDrafts() {
  return useSyncExternalStore(
    subscribeToDrafts,
    getDraftsSnapshot,
    getServerDraftsSnapshot
  );
}
