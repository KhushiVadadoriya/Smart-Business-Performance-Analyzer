export type HistoryItem = {
  fileName: string;
  date: string; // ISO
  summary: string;
  insights: string[];
};

const KEY = "sbpa.history.v1";

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object") as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
}

export function addToHistory(item: HistoryItem) {
  const items = loadHistory();
  items.unshift(item);
  saveHistory(items);
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

