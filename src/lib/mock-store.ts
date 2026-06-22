// Mock auth + app store (UI-only demo, persisted in localStorage)
import { useEffect, useState, useSyncExternalStore } from "react";

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  avatar?: string;
  memberSince: string;
};

type State = {
  user: User | null;
  users: Array<User & { password: string }>;
};

const KEY = "eco-recovery-state-v1";

function load(): State {
  if (typeof window === "undefined") return { user: null, users: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, users: [] };
}

let state: State = load();
const listeners = new Set<() => void>();

function save() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const store = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot: () => state,
  signUp(input: Omit<User, "id" | "memberSince"> & { password: string }) {
    if (state.users.find((u) => u.email === input.email)) {
      throw new Error("An account with this email already exists.");
    }
    const user: User & { password: string } = {
      ...input,
      id: crypto.randomUUID(),
      memberSince: new Date().toISOString(),
    };
    state = { ...state, users: [...state.users, user], user };
    save();
  },
  signIn(email: string, password: string) {
    const u = state.users.find((u) => u.email === email && u.password === password);
    if (!u) throw new Error("Invalid email or password.");
    const { password: _p, ...pub } = u;
    state = { ...state, user: pub };
    save();
  },
  signOut() {
    state = { ...state, user: null };
    save();
  },
  updateProfile(patch: Partial<User>) {
    if (!state.user) return;
    const updated = { ...state.user, ...patch };
    state = {
      ...state,
      user: updated,
      users: state.users.map((u) => (u.id === updated.id ? { ...u, ...patch } : u)),
    };
    save();
  },
};

export function useUser() {
  const s = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return s.user;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
