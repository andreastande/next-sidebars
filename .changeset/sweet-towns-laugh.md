---
"next-sidebars": patch
---

Fix hydration mismatch when JSX branches on `open` and stored state differs from `defaultOpen`. State is now read via `useSyncExternalStore`: hydration renders `defaultOpen`, the stored state lands right after.
