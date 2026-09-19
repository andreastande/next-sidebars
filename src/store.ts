export interface SidebarStore {
  subscribe: (onChange: () => void) => () => void
  getSnapshot: () => Record<string, boolean>
  getServerSnapshot: () => Record<string, boolean>
  setOpen: (id: string, open: boolean) => void
  toggle: (id: string) => void
}

// Any same-origin code can write this key, so tolerate arbitrary JSON.
function parseStored(json: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json || "{}")
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>
  } catch {}
  return {}
}

// Returns `base` itself when nothing differs, so callers can bail out.
// Ephemeral ids never merge: stale values (an older version, another tab)
// may still sit under the key.
function mergeStored(
  base: Record<string, boolean>,
  stored: Record<string, unknown>,
  persisted: Record<string, boolean>,
): Record<string, boolean> {
  let out = base
  for (const id in base) {
    if (!persisted[id]) continue
    const v = stored[id]
    if (typeof v === "boolean" && v !== base[id]) {
      if (out === base) out = { ...base }
      out[id] = v
    }
  }
  return out
}

/**
 * The server snapshot is always `defaults`, matching the server HTML, so
 * hydration can never mismatch; the stored state lands in the re-render
 * React schedules right after.
 */
export function createStore(
  defaults: Record<string, boolean>,
  storageKey: string,
  persisted: Record<string, boolean>,
): SidebarStore {
  const readStored = (): Record<string, unknown> => {
    try {
      return parseStored(window.localStorage.getItem(storageKey))
    } catch {
      return {}
    }
  }

  let snapshot = typeof window === "undefined" ? defaults : mergeStored(defaults, readStored(), persisted)

  const listeners = new Set<() => void>()
  const emit = () => {
    for (const listener of listeners) listener()
  }

  // "storage" fires only in other tabs (no same-tab echo), but for
  // sessionStorage writes too — hence the storageArea check.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== storageKey || e.newValue === null || e.storageArea !== window.localStorage) return
    const next = mergeStored(snapshot, parseStored(e.newValue), persisted)
    if (next === snapshot) return
    snapshot = next
    emit()
  }

  const setOpen = (id: string, open: boolean) => {
    if (snapshot[id] === open) return
    const stored = readStored()
    // The snapshot may have missed storage events, so storage stays the
    // authority for every id but the toggled one.
    snapshot = { ...mergeStored(snapshot, stored, persisted), [id]: open }
    if (persisted[id]) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify({ ...stored, [id]: open }))
      } catch {
        // Without storage the state just stops surviving reloads.
      }
    }
    emit()
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange)
      if (listeners.size === 1) {
        window.addEventListener("storage", onStorage)
        // Nothing was listening for "storage", so other tabs' writes were missed. Only
        // reachable with the provider itself hidden inside <Activity>.
        snapshot = mergeStored(snapshot, readStored(), persisted)
      }
      // <Activity> reconnects a listener without re-rendering it, so it may hold a value from writes it never saw.
      onChange()
      return () => {
        listeners.delete(onChange)
        if (listeners.size === 0) window.removeEventListener("storage", onStorage)
      }
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => defaults,
    setOpen,
    toggle: (id) => setOpen(id, snapshot[id] === false),
  }
}
