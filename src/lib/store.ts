import {
  assignSeat,
  createSeats,
  getOccupiedSeats,
  markEveryoneAway,
  markUserAway,
  releaseExpiredSeats,
  type Seat,
} from './seats';

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

export interface LiveComment {
  id: string;
  name: string;
  text: string;
  time: number;
  kind: 'wish' | 'comment';
}

const STORAGE_KEY = 'chua-tinh-tam:merit:v2';
const SEAT_GRACE_MS = 30_000;

interface PersistedStore {
  ranking: [string, number][];
  logs: RitualLog[];
  incenseCount: number;
  totalMerit: number;
  incenseOfferings?: number;
  liveMembers?: string[];
  seats?: Seat[];
  comments?: LiveComment[];
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
let incenseOfferings = Math.max(0, Number(initial?.incenseOfferings) || 0);
let liveMembers: string[] = initial?.liveMembers ?? [];
let seats: Seat[] = releaseExpiredSeats(initial?.seats?.length ? initial.seats : createSeats());
let liveComments: LiveComment[] = initial?.comments ?? [];
let releaseTimer: number | undefined;

const listeners = new Set<() => void>();

function scheduleSeatCleanup() {
  if (typeof window === 'undefined') return;
  window.clearTimeout(releaseTimer);
  releaseTimer = window.setTimeout(() => {
    seats = releaseExpiredSeats(seats);
    persist();
    listeners.forEach((fn) => fn());
  }, SEAT_GRACE_MS + 50);
}

function persist() {
  if (typeof window === 'undefined') return;
  try {
    const value: PersistedStore = {
      ranking: Array.from(ranking.entries()),
      logs: logs.slice(0, 80),
      incenseCount,
      totalMerit,
      incenseOfferings,
      liveMembers: liveMembers.slice(0, 24),
      seats,
      comments: liveComments.slice(0, 30),
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
  return () => {
    listeners.delete(fn);
  };
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

export function addIncenseOffering(n = 1) {
  incenseOfferings += Math.max(0, n);
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

export function addLiveComment(name: string, text: string, kind: LiveComment['kind'] = 'comment') {
  const cleanName = name.trim() || 'Phật tử';
  const cleanText = text.trim();
  if (!cleanText) return;
  liveComments = [{
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: cleanName,
    text: cleanText,
    time: Date.now(),
    kind,
  }, ...liveComments].slice(0, 30);
  notify();
}

export function getLiveComments(limit = 6) {
  return liveComments.slice(0, limit);
}

export function addLiveMember(name: string) {
  const cleanName = name.trim();
  if (!cleanName || cleanName === 'undefined') return;
  const result = assignSeat(seats, cleanName);
  seats = result.seats;
  liveMembers = [cleanName, ...liveMembers.filter((item) => item !== cleanName)].slice(0, 24);
  notify();
}

export function removeLiveMember(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return;
  liveMembers = liveMembers.filter((item) => item !== cleanName);
  seats = markUserAway(seats, cleanName, SEAT_GRACE_MS);
  scheduleSeatCleanup();
  notify();
}

export function getLiveMembers() {
  return liveMembers;
}

export function getLiveSeats(): Seat[] {
  seats = releaseExpiredSeats(seats);
  return getOccupiedSeats(seats);
}

export function clearLiveMembers() {
  if (liveMembers.length === 0 && !seats.some((seat) => seat.status === 'occupied')) return;
  liveMembers = [];
  seats = markEveryoneAway(seats, SEAT_GRACE_MS);
  scheduleSeatCleanup();
  notify();
}

export function getStats() {
  return { incenseCount, incenseOfferings, totalMerit };
}

export function resetMerit() {
  ranking = new Map();
  totalMerit = 0;
  incenseCount = 0;
  incenseOfferings = 0;
  logs = [];
  notify();
}
