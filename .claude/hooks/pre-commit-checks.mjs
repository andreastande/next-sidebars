// Gates `git commit` run through Claude's Bash tool on the CI checks.
//
// Formats first, then restages only the files that were already staged with
// nothing unstaged alongside, so a staged/unstaged split survives the commit.

import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const PNPM = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

const CHECKS = [
  ["pnpm lint", PNPM, ["lint"]],
  ["tsc --noEmit", PNPM, ["exec", "tsc", "--noEmit"]],
  ["pnpm build", PNPM, ["build"]],
]

// `git [flags] commit`, at the start or after a shell separator.
const COMMIT = /(^|[;&|(]|&&|\|\|)\s*git\s+(-\S+\s+)*commit(\s|$)/

function run(command, args) {
  return spawnSync(command, args, { encoding: "utf8" })
}

function block(message) {
  process.stderr.write(`${message}\n`)
  process.exit(2)
}

/** Repo-relative paths from a NUL-terminated git listing; empty on failure. */
function paths(args) {
  const result = run("git", args)
  if (result.status !== 0) return new Set()
  return new Set(result.stdout.split("\0").filter(Boolean))
}

/** Hash of the file as it sits on disk, or null if git cannot read it. */
function blob(path) {
  const result = run("git", ["hash-object", "--", path])
  return result.status === 0 ? result.stdout.trim() : null
}

function main() {
  let command
  try {
    command = JSON.parse(readFileSync(0, "utf8")).tool_input?.command ?? ""
  } catch {
    return
  }
  if (!COMMIT.test(command)) return

  process.chdir(fileURLToPath(new URL("../..", import.meta.url)))

  // Snapshot before formatting: a file in both sets is partially staged, so its
  // staged content differs from disk and `git add` would swallow the rest.
  const partial = paths(["diff", "--name-only", "-z"])
  const staged = paths(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"])

  const before = new Map()
  for (const path of staged) {
    if (existsSync(path)) before.set(path, blob(path))
  }

  const formatted = run(PNPM, ["fmt"])
  if (formatted.status !== 0) {
    block(`pnpm fmt failed — commit blocked.\n\n${(formatted.stdout + formatted.stderr).trim()}`)
  }

  const rewritten = [...before.keys()].filter((path) => existsSync(path) && blob(path) !== before.get(path))

  const conflicted = rewritten.filter((path) => partial.has(path)).toSorted()
  if (conflicted.length > 0) {
    block(
      "Commit blocked: pnpm fmt rewrote files that have both staged and unstaged changes.\n\n" +
        conflicted.map((path) => `  ${path}\n`).join("") +
        "\nRestaging these would pull their unstaged edits into the commit. " +
        "Stage the parts you want by hand, then commit again.",
    )
  }

  const restaged = []
  for (const path of rewritten.filter((candidate) => !partial.has(candidate)).toSorted()) {
    if (run("git", ["add", "--", path]).status === 0) restaged.push(path)
  }

  for (const [label, bin, args] of CHECKS) {
    const result = run(bin, args)
    if (result.status !== 0) {
      block(`${label} failed — commit blocked.\n\n${(result.stdout + result.stderr).trim()}`)
    }
  }

  if (restaged.length > 0) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          additionalContext:
            "pnpm fmt reformatted and restaged (already staged, no unstaged edits):\n" +
            restaged.map((path) => `  ${path}\n`).join(""),
        },
      }),
    )
  }
}

main()
