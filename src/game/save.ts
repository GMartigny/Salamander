import type { GameState } from "./state";

const KEY = "salamander-save-v1";

export function load(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

export function save(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private browsing); the game keeps running without saving.
  }
}

export function reset(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to remove.
  }
}
