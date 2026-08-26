# next-sidebars

Persisted sidebar state for Next.js. State lives in `localStorage`, and an inline script applies it to `<html>` before first paint — no flash of the wrong state, and no `cookies()` call keeping your layout from rendering statically. Works with Cache Components.

## Usage

```bash
npm install next-sidebars
```

Add the provider to your root layout, with `suppressHydrationWarning` on `<html>`:

```tsx
// app/layout.tsx
import { SidebarProvider } from "next-sidebars"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  )
}
```

The provider keeps a `data-sidebar` attribute on `<html>`, set to `"open"` or `"closed"`. Style against it — what closed means (hidden, icon rail, off-canvas) is your call:

```tsx
<aside className="w-64 transition-[width] in-data-[sidebar=closed]:w-16">
```

Or in plain CSS: `html[data-sidebar="closed"] aside { width: 4rem }`. If you'd rather write `sidebar-closed:w-16`, define a variant in your own CSS:

```css
@custom-variant sidebar-closed (&:where(html[data-sidebar="closed"] *));
```

Read and change the state from any client component:

```tsx
"use client"

import { useSidebar } from "next-sidebars"

export function SidebarToggle() {
  const { open, toggle } = useSidebar()

  return <button onClick={toggle}>{open ? "Collapse" : "Expand"}</button>
}
```

## Multiple sidebars

Declare them on the provider. Each gets its own persisted state and its own attribute, `data-sidebar-{id}`:

```tsx
<SidebarProvider sidebars={["nav", "inspector"]} defaultOpen={{ inspector: false }}>
```

```tsx
const inspector = useSidebar("inspector")
```

```tsx
<aside className="in-data-[sidebar-inspector=closed]:hidden">
```

## Mobile sidebars

On mobile a sidebar is usually an overlay — a drawer, a sheet, a full-screen menu — and an overlay shouldn't reopen on reload:

```tsx
<SidebarProvider sidebars={["desktop", "mobile"]} defaultOpen={{ mobile: false }} persist={{ mobile: false }}>
```

Style it off `data-sidebar-mobile` like any other sidebar, or hand the state to your overlay component:

```tsx
"use client"

import { useSidebar } from "next-sidebars"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export function MobileSidebar({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useSidebar("mobile")
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname, setOpen]) // close when a link navigates

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {children}
    </Drawer>
  )
}
```

## API

`<SidebarProvider>`

| Prop          | Default          |                                                                             |
| ------------- | ---------------- | --------------------------------------------------------------------------- |
| `sidebars`    | —                | Named sidebars. Omit for a single default one.                              |
| `defaultOpen` | `true`           | State before a visitor has toggled anything. A boolean, or a record per id. |
| `persist`     | `true`           | Whether toggles persist. A boolean, or a record per id.                     |
| `storageKey`  | `"sidebars"`     | localStorage key.                                                           |
| `attribute`   | `"data-sidebar"` | Attribute set on `<html>`.                                                  |
| `nonce`       | —                | CSP nonce for the inline script.                                            |

`useSidebar(id?)` returns `{ open, setOpen, toggle }`. The `id` is only needed when several sidebars are declared. Changes persist and sync to other tabs.

## Notes

- Prefer styling off the attribute: it's correct before first paint, while JSX branching on `open` settles just after hydration. Both hydrate cleanly.
- On a first visit or with broken storage, you get `defaultOpen`. Without JavaScript the attribute is only ever what your `<html>` hardcodes.
- Props are read at mount. One provider per app.

## License

MIT
