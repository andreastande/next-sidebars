---
name: user-docs
description: Write or edit user-facing docs — README, guides, examples, public JSDoc. Use when touching anything a consumer of this library reads.
---

# User-facing docs

The reader is a first-time consumer deciding in seconds whether to use the
library. Every sentence costs trust: bloat reads as machine-written, and they
walk away regardless of code quality. Lighter beats complete.

## Signal

Knowing a fact is not a reason to state it. Facts you were handed earn a
place only if the reader acts differently for knowing them. Working a fact in
to show it was absorbed is the classic trap, and readers smell it.

State the fact and let the reader draw the obvious conclusion. Don't answer
objections nobody raised, and don't reassure that a mechanism works. A reader
who cares about an edge gets there from one true sentence.

## Audience

Write for the reader who exists today, in their idiom: examples should look
like the code they already write, not what a textbook taught. Assume they're
smart — no hand-holding, no "simply", no prose restating what a code sample
already shows.

## Structure

A section a reader could reconstruct from what's already on the page is dead
weight. Delete the section, not just its worst sentences. Radical cuts are
allowed and are usually the fix.

## The test

Reread the result as that first-time consumer. Anything that makes them trust
the library less than the code deserves gets cut or rewritten.
