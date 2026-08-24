"use client"

import * as React from "react"
import { initSidebars } from "./script"
import type { SidebarProviderProps } from "./types"

const DEFAULT_ID = "sidebar"

export interface SidebarContextValue {
  ids: readonly string[]
  openMap: Record<string, boolean>
  setOpen: (id: string, open: boolean) => void
  toggle: (id: string) => void
}

export const SidebarContext: React.Context<SidebarContextValue | null> =
  React.createContext<SidebarContextValue | null>(null)

// Any same-origin code can write this key, so tolerate arbitrary JSON.
function parseStored(json: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json || "{}")
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, unknown>
  } catch {}
  return {}
}

// Returns `base` itself when nothing differs, so setState callers bail out.
function mergeStored(base: Record<string, boolean>, stored: Record<string, unknown>): Record<string, boolean> {
  let out = base
  for (const id in base) {
    const v = stored[id]
    if (typeof v === "boolean" && v !== base[id]) {
      if (out === base) out = { ...base }
      out[id] = v
    }
  }
  return out
}

/**
 * Provides sidebar state to `useSidebar` and injects a blocking inline
 * script that stamps the persisted state onto `<html>` before first paint —
 * the page stays fully static (no cookies, no dynamic rendering) and never
 * flashes the wrong sidebar state.
 *
 * Render it once, high in the layout, and drive collapse from CSS:
 *
 * ```css
 * html[data-sidebar="closed"] .my-sidebar { width: 0; }
 * ```
 */
export function SidebarProvider(props: SidebarProviderProps): React.JSX.Element {
  const { children, sidebars, defaultOpen, storageKey = "sidebars", attribute = "data-sidebar", nonce } = props

  const config = React.useMemo(() => {
    const ids: readonly string[] = sidebars ?? [DEFAULT_ID]
    const defaults: Record<string, boolean> = {}
    const attrs: Record<string, string> = {}
    for (const id of ids) {
      defaults[id] = typeof defaultOpen === "boolean" ? defaultOpen : (defaultOpen?.[id] ?? true)
      attrs[id] = sidebars ? `${attribute}-${id}` : attribute
    }
    // Escape "<" so consumer-provided ids/keys can never close the script tag.
    const args = [storageKey, defaults, attrs].map((arg) => JSON.stringify(arg).replace(/</g, "\\u003c")).join(",")
    return { ids, defaults, attrs, scriptHtml: `(${initSidebars.toString()})(${args})` }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not identity
  }, [JSON.stringify(sidebars), JSON.stringify(defaultOpen), storageKey, attribute])

  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return config.defaults
    try {
      return mergeStored(config.defaults, parseStored(window.localStorage.getItem(storageKey)))
    } catch {
      return config.defaults
    }
  })

  const mutate = React.useCallback(
    (id: string, compute: (open: boolean) => boolean) => {
      setOpenMap((prev) => {
        const open = compute(prev[id] !== false)
        if (prev[id] === open) return prev
        const next = { ...prev, [id]: open }
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {
          // Without storage the state just stops surviving reloads.
        }
        return next
      })
    },
    [storageKey],
  )

  const setOpen = React.useCallback((id: string, open: boolean) => mutate(id, () => open), [mutate])
  const toggle = React.useCallback((id: string) => mutate(id, (open) => !open), [mutate])

  // The blocking script stamped these attributes pre-paint; after hydration
  // this keeps them in step with toggles and cross-tab updates.
  React.useEffect(() => {
    for (const id of config.ids) {
      document.documentElement.setAttribute(config.attrs[id]!, openMap[id] === false ? "closed" : "open")
    }
  }, [config, openMap])

  // "storage" fires only in other tabs: cross-tab sync with no same-tab echo.
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey || e.newValue === null) return
      const stored = parseStored(e.newValue)
      setOpenMap((prev) => mergeStored(prev, stored))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [storageKey])

  const value = React.useMemo<SidebarContextValue>(
    () => ({ ids: config.ids, openMap, setOpen, toggle }),
    [config, openMap, setOpen, toggle],
  )

  return (
    <SidebarContext.Provider value={value}>
      <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: config.scriptHtml }} />
      {children}
    </SidebarContext.Provider>
  )
}
