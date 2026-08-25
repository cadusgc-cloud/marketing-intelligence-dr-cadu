"use client";

import { parseRealWeekStoredJson, realWeekStorageKey } from "@/lib/real-week/storage";
import type { RealWeekStoredData } from "@/lib/real-week/types";

export type RealWeekStorageResult = { ok: boolean; data: RealWeekStoredData | null; error?: string };

export function canUseRealWeekLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadRealWeekFromLocalStorage(): RealWeekStorageResult {
  if (!canUseRealWeekLocalStorage()) return { ok: false, data: null, error: "localStorage indisponivel" };
  const raw = window.localStorage.getItem(realWeekStorageKey);
  if (!raw) return { ok: true, data: null };
  const parsed = parseRealWeekStoredJson(raw);
  if (!parsed.ok) return { ok: false, data: null, error: parsed.error };
  return { ok: true, data: parsed.data };
}

export function saveRealWeekToLocalStorage(data: RealWeekStoredData): RealWeekStorageResult {
  if (!canUseRealWeekLocalStorage()) return { ok: false, data: null, error: "localStorage indisponivel" };
  window.localStorage.setItem(realWeekStorageKey, JSON.stringify(data));
  return { ok: true, data };
}

export function clearRealWeekLocalStorage(): void {
  if (!canUseRealWeekLocalStorage()) return;
  window.localStorage.removeItem(realWeekStorageKey);
}
