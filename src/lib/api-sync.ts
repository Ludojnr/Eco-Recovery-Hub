// Syncs the app-state document with the standalone backend API.
// The backend base URL comes from VITE_API_URL. When it is not set, the app
// runs in local-only mode (localStorage) and every function here is a no-op,
// so the frontend keeps working perfectly without a backend.

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const WORKSPACE_KEY = "eco-recovery-hub-workspace-id";

export function apiEnabled(): boolean {
  return typeof window !== "undefined" && API_URL.length > 0;
}

function getWorkspaceId(): string {
  let id = localStorage.getItem(WORKSPACE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ws-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(WORKSPACE_KEY, id);
  }
  return id;
}

export async function fetchRemoteState<T = unknown>(): Promise<T | null> {
  if (!apiEnabled()) return null;
  try {
    const res = await fetch(`${API_URL}/api/state`, {
      headers: { "x-workspace-id": getWorkspaceId() },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    // Network/backend unavailable — fall back to local state.
    return null;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pending: unknown = null;

// Debounced save so rapid state mutations collapse into one network write.
export function scheduleRemoteSave(data: unknown): void {
  if (!apiEnabled()) return;
  pending = data;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushRemoteSave, 600);
}

async function flushRemoteSave(): Promise<void> {
  saveTimer = null;
  const data = pending;
  pending = null;
  if (data == null) return;
  try {
    await fetch(`${API_URL}/api/state`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-workspace-id": getWorkspaceId(),
      },
      body: JSON.stringify({ data }),
      keepalive: true,
    });
  } catch {
    // Best-effort: localStorage still holds the source of truth offline.
  }
}
