---
"next-sidebars": patch
---

Fix a toggle in a tab with stale state reverting other sidebars everywhere: `setOpen` now merges stored state before writing and persists only the toggled id. A side effect is that `defaultOpen` changes keep applying to sidebars a visitor never toggled.
