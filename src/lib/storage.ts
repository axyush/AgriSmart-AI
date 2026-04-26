// Local storage helpers for history, cache, and profile.
// Keep simple, sync, and SSR-safe.

const isClient = () => typeof window !== "undefined";

export function lsGet<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function lsSet<T>(key: string, value: T): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — ignore silently.
  }
}

export function lsRemove(key: string): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ---- History types ----

export interface ChatHistoryItem {
  id: string;
  title: string;       // first user message (truncated)
  preview: string;     // first assistant reply (truncated)
  messages: { role: "user" | "assistant"; text: string; image?: string; ts: string }[];
  lang: string;
  createdAt: number;
}

export interface CropHistoryItem {
  id: string;
  form: { location: string; soil: string; season: string; water: string; area: string };
  results: any[];
  lang: string;
  createdAt: number;
}

export interface DiseaseHistoryItem {
  id: string;
  thumbnail: string;   // data URL (small)
  result: any;
  lang: string;
  createdAt: number;
}

export const KEYS = {
  chatHistory: "agri-history-chat",
  cropHistory: "agri-history-crops",
  diseaseHistory: "agri-history-diseases",
  cropLast: "agri-cache-crops-last",
  diseaseLast: "agri-cache-diseases-last",
  profile: "agri-profile",
  onboarded: "agri-onboarded",
  expertTickets: "agri-expert-tickets",
} as const;

// Cap history size to avoid blowing localStorage.
export function pushHistory<T extends { id: string }>(key: string, item: T, max = 25): T[] {
  const list = lsGet<T[]>(key, []);
  const next = [item, ...list].slice(0, max);
  lsSet(key, next);
  return next;
}

export function deleteHistory<T extends { id: string }>(key: string, id: string): T[] {
  const list = lsGet<T[]>(key, []);
  const next = list.filter((x) => x.id !== id);
  lsSet(key, next);
  return next;
}
