/**
 * Runs before first paint via an inline <script>. Serialized with
 * `Function.prototype.toString`, so everything in its body ships into the
 * consumer's HTML: no imports, no module-scope references, no comments.
 * The outer catch swallows everything — a blocking script must never take
 * the page down with it.
 */
export function initSidebars(
  storageKey: string,
  defaults: Record<string, boolean>,
  attributes: Record<string, string>,
  persisted: Record<string, boolean>,
): void {
  try {
    let stored: Record<string, unknown> = {}
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "{}")
      if (typeof parsed === "object" && parsed !== null) stored = parsed as Record<string, unknown>
    } catch {}
    for (const id in attributes) {
      const v = persisted[id] ? stored[id] : undefined
      const open = typeof v === "boolean" ? v : defaults[id] !== false
      document.documentElement.setAttribute(attributes[id]!, open ? "open" : "closed")
    }
  } catch {}
}
