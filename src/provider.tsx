"use client"

import * as React from "react"
import { initSidebars } from "./script"
import { createStore, type SidebarStore } from "./store"
import type { SidebarProviderProps } from "./types"

const DEFAULT_ID = "sidebar"

export interface SidebarContextValue {
  ids: readonly string[]
  store: SidebarStore
}

export const SidebarContext: React.Context<SidebarContextValue | null> =
  React.createContext<SidebarContextValue | null>(null)

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
  const { children, sidebars, defaultOpen, persist, storageKey = "sidebars", attribute = "data-sidebar", nonce } = props

  const config = React.useMemo(() => {
    const ids: readonly string[] = sidebars ?? [DEFAULT_ID]
    const defaults: Record<string, boolean> = {}
    const attrs: Record<string, string> = {}
    const persisted: Record<string, boolean> = {}
    for (const id of ids) {
      defaults[id] = typeof defaultOpen === "boolean" ? defaultOpen : (defaultOpen?.[id] ?? true)
      attrs[id] = sidebars ? `${attribute}-${id}` : attribute
      persisted[id] = typeof persist === "boolean" ? persist : (persist?.[id] ?? true)
    }
    // Escape "<" so consumer-provided ids/keys can never close the script tag.
    const args = [storageKey, defaults, attrs, persisted]
      .map((arg) => JSON.stringify(arg).replace(/</g, "\\u003c"))
      .join(",")
    return { ids, defaults, attrs, persisted, scriptHtml: `(${initSidebars.toString()})(${args})` }
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- keyed by content, not identity
  }, [JSON.stringify(sidebars), JSON.stringify(defaultOpen), JSON.stringify(persist), storageKey, attribute])

  const store = React.useMemo(() => createStore(config.defaults, storageKey, config.persisted), [config, storageKey])

  // The blocking script stamped these pre-paint; this keeps them in step with
  // the store. Rendered state would briefly stamp `defaultOpen` at hydration.
  React.useEffect(() => {
    const stamp = () => {
      const snapshot = store.getSnapshot()
      for (const id of config.ids) {
        document.documentElement.setAttribute(config.attrs[id]!, snapshot[id] === false ? "closed" : "open")
      }
    }
    stamp()
    return store.subscribe(stamp)
  }, [config, store])

  const value = React.useMemo<SidebarContextValue>(() => ({ ids: config.ids, store }), [config, store])

  return (
    <SidebarContext.Provider value={value}>
      <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: config.scriptHtml }} />
      {children}
    </SidebarContext.Provider>
  )
}
