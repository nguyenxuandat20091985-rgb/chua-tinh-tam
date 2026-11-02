/** Simple in-memory store for merit ranking + ritual log */

export interface MeritEntry {
  name: string;
  points: number;
}

export interface RitualLog {
  id: string;
  time: number;
  user: string;
  event: string;
  ritual: string;
  merit: number;
  detail: string;
}

const STORAGE_KEY = 'chua-tinh-tam:merit:v1';

interface PersistedStore {
  ranking: [string, number][];
  logs: RitualLog[];
  incenseCount: number;
  totalMerit: number;
}

function loadStore(): PersistedStore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as PersistedStore;
    if (!Array.isArray(value.ranking) || !Array.isArray(value.logs)) return null;
    return value;
  } catch {
    return null;
  }
}

const initial = loadStore();
let ranking = new Map<string, number>(initial?.ranking ?? []);
let logs: RitualLog[] = initial?.logs ?? [];
let incenseCount = Math.max(0, Number(initial?.incenseCount) || 0);
let totalMerit = Math.max(0, Number(initial?.totalMerit) || 0);

const listeners = new Set<() => void>();

function persist() {
  if (typeof window === 'undefined') return;
  try {
    const value: PersistedStore = {
      ranking: Array.from(ranking.entries()),
      logs: logs.slice(0, 80),
      incenseCount,
      totalMerit,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full; in-memory operation remains available.
  }
}

function notify() {
  persist();
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addMerit(name: string, points: number) {
  const cur = ranking.get(name) || 0;
  ranking.set(name, cur + points);
  totalMerit += points;
  notify();
}

export function addIncense(n = 1) {
  incenseCount += n;
  notify();
}

export function pushLog(entry: Omit<RitualLog, 'id' | 'time'>) {
  logs.unshift({
    ...entry,
    id: Math.random().toString(36).slice(2),
    time: Date.now(),
  });
  if (logs.length > 80) logs = logs.slice(0, 80);
  notify();
}

export function getTopRanking(limit = 10): MeritEntry[] {
  return Array.from(ranking.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, points]) => ({ name, points }));
}

export function getLogs() {
  return logs;
}

export function getStats() {
  return { incenseCount, totalMerit };
}

export function resetMerit() {
  ranking = new Map();
  totalMerit = 0;
  incenseCount = 0;
  logs = [];
  notify();
}
