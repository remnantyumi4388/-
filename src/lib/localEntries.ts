import type { PortfolioEntry } from "@/lib/types";

export const PUBLIC_ENTRIES_KEY = "portfolio_public_entries";

export function ownerEntriesKey(ownerId: string) {
  return `portfolio_entries_${ownerId}`;
}

export function readStoredEntries(key: string): PortfolioEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PortfolioEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeStoredEntries(key: string, entries: PortfolioEntry[]) {
  window.localStorage.setItem(key, JSON.stringify(entries));
}

export function upsertPublicEntry(entry: PortfolioEntry) {
  const current = readStoredEntries(PUBLIC_ENTRIES_KEY).filter((item) => item.id !== entry.id);
  writeStoredEntries(PUBLIC_ENTRIES_KEY, entry.isPublic ? [entry, ...current] : current);
}

export function removePublicEntry(entryId: string) {
  writeStoredEntries(PUBLIC_ENTRIES_KEY, readStoredEntries(PUBLIC_ENTRIES_KEY).filter((entry) => entry.id !== entryId));
}
