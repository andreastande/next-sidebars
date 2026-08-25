# next-sidebars

## 0.1.4

### Patch Changes

- [`69e735b`](https://github.com/andreastande/next-sidebars/commit/69e735b4cade7c0ad4bbcaff0185d1d744424c35) Thanks [@andreastande](https://github.com/andreastande)! - Ignore `storage` events from sessionStorage: a same-origin window writing sessionStorage under the same key no longer alters sidebar state.

## 0.1.3

### Patch Changes

- [`e981608`](https://github.com/andreastande/next-sidebars/commit/e98160812205404b73883cc0b27abe6cfcb107d0) Thanks [@andreastande](https://github.com/andreastande)! - Fix a toggle in a tab with stale state reverting other sidebars everywhere: `setOpen` now merges stored state before writing and persists only the toggled id. A side effect is that `defaultOpen` changes keep applying to sidebars a visitor never toggled.

## 0.1.2

### Patch Changes

- [`0d4d625`](https://github.com/andreastande/next-sidebars/commit/0d4d6254274f29cd09c4a1851da37875ee4ba9df) Thanks [@andreastande](https://github.com/andreastande)! - Fix hydration mismatch when JSX branches on `open` and stored state differs from `defaultOpen`. State is now read via `useSyncExternalStore`: hydration renders `defaultOpen`, the stored state lands right after.

## 0.1.1

### Patch Changes

- [`bb2984c`](https://github.com/andreastande/next-sidebars/commit/bb2984cc9a227575a57dfc65abae13984d785dbd) Thanks [@andreastande](https://github.com/andreastande)! - Fix the README's `sidebar-closed` variant, which overrode utilities like `hover:`

## 0.1.0

### Minor Changes

- [`5b07204`](https://github.com/andreastande/next-sidebars/commit/5b0720442256476dd56137b9945c8c1a0b514641) Thanks [@andreastande](https://github.com/andreastande)! - Initial release
