"use client"

import * as React from "react"
import { SidebarContext } from "./provider"
import type { UseSidebarReturn } from "./types"

/**
 * State and controls for one sidebar.
 *
 * `id` is required when the provider declares several sidebars, and must
 * match one of them. Throws outside a `<SidebarProvider>`.
 */
export function useSidebar(id?: string): UseSidebarReturn {
  const ctx = React.useContext(SidebarContext)
  if (ctx === null) {
    throw new Error("[next-sidebars] useSidebar must be used within a <SidebarProvider>.")
  }
  if (id === undefined && ctx.ids.length !== 1) {
    throw new Error(
      `[next-sidebars] useSidebar() needs an id when multiple sidebars are declared. Declared: ${ctx.ids.join(", ")}.`,
    )
  }
  if (id !== undefined && !ctx.ids.includes(id)) {
    throw new Error(`[next-sidebars] Unknown sidebar "${id}". Declared: ${ctx.ids.join(", ")}.`)
  }

  const resolved = id ?? ctx.ids[0]!
  const open = ctx.openMap[resolved] !== false
  const { setOpen: ctxSetOpen, toggle: ctxToggle } = ctx

  const setOpen = React.useCallback((next: boolean) => ctxSetOpen(resolved, next), [ctxSetOpen, resolved])
  const toggle = React.useCallback(() => ctxToggle(resolved), [ctxToggle, resolved])

  return React.useMemo(() => ({ open, setOpen, toggle }), [open, setOpen, toggle])
}
