---
name: bug-hunt
description: Hunt for genuine, reproducible bugs in the next-sidebars source. Use when asked to audit, review, or find bugs in this library.
---

# Bug hunt

Find real bugs in `src/` — defects that produce wrong behavior for a consumer of
this library. Nothing else: no style notes, no refactors, no "consider adding
tests", no speculative hardening of things that can't actually happen.

There is no test runner here. Verification is reasoning about concrete
execution, not running code.

## What counts

A bug is a claim you can state as: _given this consumer setup and this sequence
of events, the library does X, and X is wrong._ If you cannot name the setup and
the sequence, you do not have a bug yet — drop it.

Rank by what a consumer would actually hit. A wrong sidebar state on a normal
first paint outranks a leak that needs a synthetic 10k-remount loop.

## This library's real hazards

Read all of `src/` (~260 lines) before judging anything — every file interacts
with the others.

- **The pre-paint script.** `src/script.ts` ships via
  `Function.prototype.toString()`. Ask what a bundler/minifier can do to that
  function's identifier and body, what happens if its body ever references
  anything outside itself, and whether the serialized call site in
  `provider.tsx` is airtight against consumer-supplied strings.
- **Script vs. store vs. render agreement.** Three things decide "open":
  the inline script's attribute stamp, `getSnapshot`, and `getServerSnapshot`.
  Trace a full first load — server HTML, script, hydration, effect — and check
  they can't disagree, including for ids and defaults shapes that don't line up.
- **Default semantics.** `!== false` and `?? true` appear in several places.
  Check they agree with each other and with `defaultOpen` in all its forms
  (boolean, partial record, missing id, explicit `false`).
- **Store lifecycle.** `subscribe` adds a `storage` listener per subscriber and
  removes it only when the set empties; `snapshot` is module-free mutable
  state. Check listener bookkeeping, and what a new store identity does to
  already-mounted `useSyncExternalStore` consumers when provider props change.
- **Cross-tab sync.** `onStorage` merges against the current snapshot, not
  defaults, and ignores `newValue === null`. Find the sequences where two tabs
  end up disagreeing, or where a value that changed fails to propagate.
- **Multiple providers / shared storageKey.** Two providers, overlapping or
  disjoint ids, same key. What gets clobbered.
- **SSR and environment.** Anything touching `window`, `document`, or
  `localStorage` — where it runs, and what a throwing or absent storage does.
- **Public surface.** `types.ts` and `index.ts` versus actual behavior: does the
  documented contract match what happens, on React 18 as well as 19.

## Verify before reporting

For each candidate, try hard to refute it: re-read the code paths, and name the
guard that would make it a non-issue. Keep it only if no guard exists.
Distinguish confirmed (you traced it end to end) from plausible (you believe it
but a runtime detail decides).

## Output

Nothing found is a valid, useful answer — say so plainly rather than padding.

Otherwise, per bug, most severe first:

- `file:line`
- One sentence on the defect.
- Concrete trigger: the consumer's props/setup and the event sequence.
- Wrong result vs. expected result.
- Confirmed or plausible, and if plausible, what would settle it.
- Smallest fix, in one or two sentences. Do not apply it unless asked.
