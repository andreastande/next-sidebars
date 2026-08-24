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
  const { open, setOpen, toggle } = useSidebar()
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

## API

`<SidebarProvider>`

| Prop          | Default          |                                                                             |
| ------------- | ---------------- | --------------------------------------------------------------------------- |
| `sidebars`    | —                | Named sidebars. Omit for a single default one.                              |
| `defaultOpen` | `true`           | State before a visitor has toggled anything. A boolean, or a record per id. |
| `storageKey`  | `"sidebars"`     | localStorage key.                                                           |
| `attribute`   | `"data-sidebar"` | Attribute set on `<html>`.                                                  |
| `nonce`       | —                | CSP nonce for the inline script.                                            |

`useSidebar(id?)` returns `{ open, setOpen, toggle }`. The `id` is only needed when several sidebars are declared. Changes persist and sync to other tabs.

## Notes

- Style off the attribute rather than branching on `open` in JSX. The server renders `defaultOpen`, so conditional markup can mismatch at hydration; attribute-driven styling can't.
- Without JavaScript, on a first visit, or with broken storage, you get `defaultOpen`.
- Props are read at mount. One provider per app.

## License

MIT
