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

let ranking = new Map<string, number>();
let logs: RitualLog[] = [];
let incenseCount = 0;
let totalMerit = 0;

const listeners = new Set<() => void>();

function notify() {
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
  return { incenseCount, totalMerit, onlineSim: 80 + Math.floor(Math.random() * 40) };
}

export function resetMerit() {
  ranking = new Map();
  totalMerit = 0;
  incenseCount = 0;
  logs = [];
  notify();
}
