# next-sidebars

## 0.2.1

### Patch Changes

- [`999a3d0`](https://github.com/andreastande/next-sidebars/commit/999a3d042c7a8a8eefc2edc1ece42069d1491e09) Thanks [@andreastande](https://github.com/andreastande)! - Catch up on changes missed while a sidebar was hidden inside React's `<Activity>`. `<Activity>` disconnects effects but keeps state, so a hidden subscriber missed writes from other tabs and from this one, and could reveal showing the state from before it was hidden. The provider now re-reads localStorage when it regains its first subscriber, and notifies each listener as it subscribes.

## 0.2.0

### Minor Changes

- [`de4c8f8`](https://github.com/andreastande/next-sidebars/commit/de4c8f825b7988da9bdbfd094e9961ed3eea93dc) Thanks [@andreastande](https://github.com/andreastande)! - Add a `persist` prop to opt sidebars out of localStorage persistence. An ephemeral sidebar always loads as `defaultOpen` — right for mobile overlay sidebars, which shouldn't reopen on reload.

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
