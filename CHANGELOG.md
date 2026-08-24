# next-sidebars

## 0.1.2

### Patch Changes

- [`0d4d625`](https://github.com/andreastande/next-sidebars/commit/0d4d6254274f29cd09c4a1851da37875ee4ba9df) Thanks [@andreastande](https://github.com/andreastande)! - Fix hydration mismatch when JSX branches on `open` and stored state differs from `defaultOpen`. State is now read via `useSyncExternalStore`: hydration renders `defaultOpen`, the stored state lands right after.

## 0.1.1

### Patch Changes

- [`bb2984c`](https://github.com/andreastande/next-sidebars/commit/bb2984cc9a227575a57dfc65abae13984d785dbd) Thanks [@andreastande](https://github.com/andreastande)! - Fix the README's `sidebar-closed` variant, which overrode utilities like `hover:`

## 0.1.0

### Minor Changes

- [`5b07204`](https://github.com/andreastande/next-sidebars/commit/5b0720442256476dd56137b9945c8c1a0b514641) Thanks [@andreastande](https://github.com/andreastande)! - Initial release
