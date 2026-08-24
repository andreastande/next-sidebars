import type { ReactNode } from "react"

export interface SidebarProviderProps {
  children?: ReactNode
  /**
   * Named sidebars, e.g. `["nav", "inspector"]`. Each gets its own
   * persisted state and its own attribute on `<html>`. Omit for a single
   * default sidebar.
   */
  sidebars?: string[]
  /**
   * State for visitors with nothing persisted yet: a boolean for every
   * sidebar, or a record per id (unlisted ids open). Once a visitor
   * toggles, their stored state wins over this.
   */
  defaultOpen?: boolean | Record<string, boolean>
  /**
   * localStorage key the state map is persisted under. Defaults to
   * `"sidebars"`. Change it when several apps share an origin.
   */
  storageKey?: string
  /**
   * Attribute maintained on `<html>`, valued `"open"` or `"closed"` —
   * the hook for your collapse CSS. Defaults to `"data-sidebar"`; named
   * sidebars get `-{id}` appended, e.g. `data-sidebar-nav`.
   */
  attribute?: string
  /** CSP nonce for the injected inline script. */
  nonce?: string
}

export interface UseSidebarReturn {
  open: boolean
  /** Sets the state, persists it, and syncs other tabs. */
  setOpen: (open: boolean) => void
  toggle: () => void
}
