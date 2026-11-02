export type SeatSide = 'left' | 'right';
export type SeatStatus = 'available' | 'occupied' | 'away';

export interface Seat {
  id: string;
  side: SeatSide;
  depth: number;
  x: number;
  y: number;
  status: SeatStatus;
  occupiedBy?: string;
  releaseAt?: number;
}

// Tọa độ tính theo phần trăm của ảnh nền 9:16.
// depth=0 ở gần tượng, depth=7 ở gần camera.
const ROWS = [
  { y: 50, x: [13, 23, 33] },
  { y: 56, x: [11, 21, 31] },
  { y: 62, x: [9, 19, 29] },
  { y: 68, x: [7, 17, 27] },
  { y: 74, x: [5, 15, 25] },
  { y: 80, x: [4, 14, 24] },
  { y: 86, x: [3, 13, 23] },
  { y: 91, x: [2, 12, 22] },
];

export function createSeats(): Seat[] {
  return ROWS.flatMap((row, depth) =>
    (['left', 'right'] as SeatSide[]).flatMap((side) =>
      row.x.map((x, index) => ({
        id: `${side}-${depth}-${index}`,
        side,
        depth,
        x,
        y: row.y,
        status: 'available' as const,
      }))
    )
  );
}

export function releaseExpiredSeats(seats: Seat[], now = Date.now()): Seat[] {
  return seats.map((seat) => {
    if (seat.status === 'away' && seat.releaseAt && seat.releaseAt <= now) {
      return { ...seat, status: 'available', occupiedBy: undefined, releaseAt: undefined };
    }
    return seat;
  });
}

export function findSeatForUser(seats: Seat[], username: string): Seat | undefined {
  const clean = username.trim();
  return seats.find((seat) => seat.occupiedBy === clean && seat.status !== 'available');
}

export function assignSeat(seats: Seat[], username: string, now = Date.now()): { seats: Seat[]; seat?: Seat } {
  const clean = username.trim();
  if (!clean) return { seats };

  const refreshed = releaseExpiredSeats(seats, now);
  const existing = findSeatForUser(refreshed, clean);
  if (existing) {
    const next = refreshed.map((seat) => seat.id === existing.id
      ? { ...seat, status: 'occupied' as const, releaseAt: undefined }
      : seat);
    return { seats: next, seat: next.find((seat) => seat.id === existing.id) };
  }

  // Lấp từ hàng gần tượng ra phía camera để chính điện đầy dần tự nhiên.
  const available = refreshed
    .filter((seat) => seat.status === 'available')
    .sort((a, b) => a.depth - b.depth || (a.side === 'left' ? -1 : 1));
  const target = available[0];
  if (!target) return { seats: refreshed };

  const next = refreshed.map((seat) => seat.id === target.id
    ? { ...seat, status: 'occupied' as const, occupiedBy: clean, releaseAt: undefined }
    : seat);
  return { seats: next, seat: next.find((seat) => seat.id === target.id) };
}

export function markUserAway(seats: Seat[], username: string, graceMs = 30_000, now = Date.now()): Seat[] {
  const clean = username.trim();
  return seats.map((seat) => seat.occupiedBy === clean
    ? { ...seat, status: 'away' as const, releaseAt: now + graceMs }
    : seat);
}

export function markEveryoneAway(seats: Seat[], graceMs = 30_000, now = Date.now()): Seat[] {
  return seats.map((seat) => seat.status === 'occupied'
    ? { ...seat, status: 'away' as const, releaseAt: now + graceMs }
    : seat);
}

export function getOccupiedSeats(seats: Seat[], now = Date.now()): Seat[] {
  return releaseExpiredSeats(seats, now).filter((seat) => seat.status === 'occupied' && seat.occupiedBy);
}
