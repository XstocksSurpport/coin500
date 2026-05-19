const KEY = "coin500_watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function toggleWatchlist(id: string): string[] {
  const list = getWatchlist();
  const next = list.includes(id)
    ? list.filter((x) => x !== id)
    : [...list, id];
  saveWatchlist(next);
  return next;
}

export function isWatchlisted(id: string): boolean {
  return getWatchlist().includes(id);
}
