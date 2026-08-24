# Rules

## Code comments

A comment must say something the code cannot, in words that all earn their
place, to a reader who knows the project but wasn't there when
it was written. It describes the code as it stands — never what was removed or
how it got here. JSDoc is held to the same bar, from the consumer's chair:
only what they can act on. When in doubt, delete.

## Formatting and linting

Run before every commit, then stage — `pnpm fmt` rewrites in place, so `git add`
anything already staged again:

```bash
pnpm fmt && pnpm lint && pnpm exec tsc --noEmit && pnpm build
```
