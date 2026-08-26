---
name: refactor
description: Refactor the next-sidebars source without changing behavior. Use when asked to refactor, restructure, simplify, or clean up code in this library.
---

# Refactor

Improve the structure of `src/` while provably preserving behavior. Nothing
else: no features, no API changes, no bug fixes (if you find a bug, report it
separately and leave it in place — a refactor that silently fixes behavior is
a behavior change), no speculative abstraction for needs that don't exist.

There is no test runner here. Proof of preservation is reasoning about
concrete execution, not running code.

## What counts

A refactor is a claim you can state as: _this change makes X clearer, smaller,
or better-factored, and here is why every observable behavior is identical._
If you cannot argue the second half path by path, you do not have a refactor
yet — drop it.

This library is ~270 lines and values smallness. A refactor should delete
lines, collapse duplication that could actually drift apart, or make a real
invariant visible. Renames, reshuffles, and "extract helper" moves that leave
the line count and the reader's burden the same are churn — skip them.

The current file layout is not sacred. A new file is on the table when code
has found a boundary the layout doesn't express — held to the same bar as any
other move: it must make the structure truer, not just smaller files.

## This library's invariants

Read all of `src/` before touching anything — every file interacts with the
others. Any refactor must keep these true:

- **The serialized script.** `initSidebars` in `src/script.ts` ships via
  `Function.prototype.toString()` into consumer HTML. Its body must stay
  self-contained: no imports, no references to module scope, no comments, no
  helpers extracted out of it — even ones that look shareable with `store.ts`.
  Deduplicating its parse logic into a shared function breaks the build output,
  not the types. Also keep the call site in `provider.tsx` airtight against
  consumer strings (the `<` escaping).
- **Hydration agreement.** `getServerSnapshot` must return `defaults` exactly,
  matching the server HTML, and the stored state must land only client-side.
  Any change to when `snapshot` is initialized or merged can reintroduce
  hydration mismatch or a first-paint flash.
- **Default semantics.** `!== false` and `?? true` encode "missing means open"
  consistently across script, store, hook, and effect. A refactor that
  normalizes these must prove all four sites still agree for every
  `defaultOpen` shape (boolean, partial record, missing id, explicit `false`).
- **Referential identity.** `mergeStored` returns `base` itself when nothing
  differs — callers bail out on that. The memoized `config`/`store`/`value`
  identities gate effects and `useSyncExternalStore` resubscription. Changing
  what an identity is keyed on changes behavior.
- **Listener bookkeeping.** One `storage` listener shared across subscribers,
  removed only when the set empties. `subscribe` must stay usable as a
  `useSyncExternalStore` argument (stable identity, correct unsubscribe).
- **Environment tolerance.** SSR (`typeof window`), throwing/absent
  localStorage, and the outer catch in the blocking script are load-bearing.
- **Public surface.** `index.ts` and `types.ts` are the contract, including
  documented JSDoc semantics, `"use client"` directives, and React 18 + 19
  compatibility. None of it moves.

Comment rules from CLAUDE.md apply to every line you touch: comments say what
the code cannot, or they go.

## Verify before applying

For each candidate, try hard to refute it: trace the exact paths before and
after — first load, toggle, cross-tab event, provider prop change, SSR — and
name any invariant above it brushes against. Apply it only if the traces are
identical. If a runtime detail you can't settle decides it, don't apply it;
report it as a proposal instead.

## Output

Nothing worth changing is a valid, useful answer — say the code is already
right rather than inventing churn.

Otherwise, per refactor applied, most valuable first:

- `file:line`
- What changed, in one sentence.
- Why it's better: what a reader or maintainer gains, concretely.
- The behavior-preservation argument: which paths you traced and why they're
  identical.
- Any proposal you did not apply, with what would settle it.
