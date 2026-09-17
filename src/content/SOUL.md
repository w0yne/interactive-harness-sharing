# SOUL

> SOUL is a single, mechanically-injected, cross-tool constitution. It exists because in a multi-tool setup rules drift and an individual tool's state is untrustworthy; its purpose is to make the AI's behavior handoff-able — survivable across tools and across people.
>
> Governance: the human legislates (decides every add / change / removal); the AI is the sole scribe (executes all edits — the human does not hand-edit this file) but never edits SOUL on its own initiative; the AI may propose a change when it observes a recurring, cross-task pattern worth codifying, and the human rules on it. In short: AI proposes → human decides → AI writes.

## First Law — English Only

All content in SOUL must be written in English.

## Second Law — Supremacy

SOUL is the constitution and holds the highest priority. If any other rule file conflicts with SOUL, SOUL prevails.

## Third Law — Changelog Externalized

SOUL's own revision history lives in the sibling file [SOUL.changelog.md](#changelog), NOT in this file — SOUL's body stays pure (starts with `# SOUL`, no front-matter, no embedded change log) because it is injected verbatim into every tool.

`SOUL.changelog.md` must be written entirely in English (per the First Law, it is part of SOUL). Every change to SOUL must prepend an entry there, formatted as a list (NOT a table): an `## <YYYY-MM-DDTHH-MM> · <Author>` heading followed by bullet points describing the change. Reverse chronological — newest first, the bottom entry is the earliest record.

## Section 1. Communication Language

Communicate with the user primarily in Chinese. Keep technical terms and software-development jargon (e.g. inline policy, build context, cache mount, tmux session, launchd) in English — do not force-translate them. Never switch to another language without reason.

## Section 2. Repository Structure (Parent / Child)

Projects follow a **parent workspace + independent child code repo** model:

- **Parent = where work happens.** A private workspace repo holding all process material: docs, technical decisions, plans, handoffs, temporary files. Everything may be committed here (docs/process/decisions), but never live secrets.
- **Child = the actual code repo.** An independent git repo (not a submodule), excluded from the parent via `.gitignore`, with its own remote and lifecycle. Code operations happen inside the child directory.
- The local folder name is often bound to the active session/memory — do not rename it without cause.

### 2.1 Content Ownership: Follows the Project's Repo Topology

Where code and documents belong is **not a fixed rule** — it follows the actual git topology of *this* project, which differs per project and cannot be assumed in advance.

- **Topology is established at injection time.** When SOUL is brought into a project (new or existing), probe the real repo structure and record it as the project's single source of truth (per Section 14): which repos exist, each one's visibility (private/public), and the parent/child relationships — including child repos that are gitignored out of the parent.
- **Probe what is observable, ask only for intent.** `git remote`, repo visibility, and `.gitignore`-excluded nested repos are observable — read them, do not ask. Future intent (whether a child repo will later be split out; whether a public repo is public on purpose or only temporarily) is *not* observable — confirm it with the user.
- **Existing projects already have a geography — survey it, do not impose one.** Reflect what is there; propose changes, do not force them.

Until that topology is recorded, fall back to safe defaults:

- Design and process material — internal notes, architecture/infrastructure *design*, process artifacts, and tooling/analysis scripts written for the project's own work — stays **private, in the parent**.
- Only outward-facing **deliverable** code goes to its corresponding repo.
- **Invariant, never overridden by topology:** secrets never enter any repo (Section 4); any outward exposure requires human confirmation (Section 5); default to private when unsure.

When a placement decision isn't answered by the recorded topology or these defaults, ask.

## Section 3. Injection-Entry Files Are Frozen

These three files are SOUL's cross-tool injection entries. Do NOT rename, move, delete, edit their content, or change what they point at (including `AGENTS.md`'s symlink target) — unless the user explicitly instructs otherwise:

- `.kiro/steering/kiro-instructions.md`
- `CLAUDE.md`
- `AGENTS.md`

## Section 4. Commit Rules

- **Decide which repo first.** Parent and child are separate git repos. A bare instruction like "commit" / "push" is ambiguous — **default to confirming the target repo** unless the user explicitly names one.
- **Never run `git add -A` from the parent root.** Use precise `git add <path>` to avoid accidentally staging the child repo or unrelated changes.
- **Secrets never enter any repo.** `.env`, key files, real tokens/credentials, real IDs are permanently gitignored — private repos included.
- Only commit/push when the user explicitly asks.

## Section 5. Public / Visibility Gate (Human Confirmation Required)

- Any operation that exposes content externally — making a repo public, pushing to a shared/public repo, creating an outward-facing repo, mutating shared issues/PRs — requires **explicit human confirmation before execution**. Present the exact proposed content as a draft first.
- **Public actions are irreversible.** Once pushed, content is cached by mirrors/clones/search engines; later deletion or history rewrite cannot guarantee removal. Prevent before push, do not patch after.

### 5.1 Pre-Commit Safety Review for Shared / Public Repos

Before any `git add` / `commit` / `push` to a shared or public repo, scan the **staged diff** (not just the working tree) against grouped red lines. Any failed check → **stop and ask**; default to staying in the internal repo:

- **A. Secrets / credentials** — tokens, API keys, access keys, private keys, real identifiers. A hit is an absolute STOP. Verify placeholders are actually placeholders, not real values.
- **B. Identity / internal markers** — internal emails, account IDs, internal hostnames/tooling, real personal paths (use neutral placeholders), unexpected committer/co-author identities.
- **C. Customer / project privacy** — customer or engagement names (and their abbreviations), private session names, customer paths. Use neutral names in test fixtures.
- **D. Internal/process content leakage** — design discussions, handoffs, decision notes, temp files, comments referencing invisible internal rules or specific machines. These belong only in the internal/parent repo.
- **E. Git metadata / refs** — never `git push --mirror` or push `refs/*` to a public repo (local tooling may create refs that leak internal traces). Use explicit `git push origin <branch>`.

## Section 6. Project File Layout

Project working files live in **top-level folders directly under the repo root** — **do NOT introduce a `docs/` (or other) intermediate layer** above them. Each governed working-folder type has its own Section below; a folder's sub-folders are sub-sections of that Section.

```text
<repo root>/
├── AGENTS.md -> SOUL.md
├── CLAUDE.md
├── README.md
├── SOUL.changelog.md
├── SOUL.md
├── SOUL.naming-convention.md
├── goals/                     Section 9
├── handoff/                   Section 7
├── issues/                    Section 11
├── tech/                      Section 8
│   └── expert/                Section 8.1
└── todos/                     Section 10
```

**Adding a new working-folder type:** create the folder, register it in this tree, and append a new Section for it at the end (numbers are never renumbered — see [SOUL.naming-convention.md](#naming)). Only this Section's tree needs updating; the ordering elsewhere does not change. Cross-cutting rules (language, commits, visibility, etc.) are NOT folders and keep their own Sections.

## Section 7. Handoff Rule (`handoff/`)

- Save session handoffs into the parent repo's designated handoff folder, named `<CST-timestamp>-handoff.md` using local time: `date +%Y-%m-%dT%H-%M` (NOT `date -u`, which is UTC and 8h off).
- A handoff must be **fully self-contained** — survive a context reset without relying on conversation memory (concrete paths, commit hashes, IDs, next steps). It is a checkpoint, not an ending.
- After writing a handoff, do **not** proactively ask whether to commit it — the user decides timing. When the user later says "commit", include the handoff as normal.

## Section 8. Tech Docs (`tech/`)

- New technical docs **default to a CST timestamp prefix** `<YYYY-MM-DDTHH-MM>-<name>.md` (`date +%Y-%m-%dT%H-%M`) — one-off runbooks, technical-discussion notes, fact/resource snapshots, investigation findings.
- **Exceptions (no timestamp):** (1) the user explicitly asks for none; (2) long-lived general rule/practice/methodology docs; (3) **expert docs** (see 8.1).
- When in doubt, add the timestamp.

### 8.1 Expert Docs (`tech/expert/`)

`tech/expert/` holds **validated, durable technical knowledge** — content that has been tested/verified and distilled into a stable reference ("expert" = the settled, authoritative version, not a one-off note).

- **Naming:** expert docs use a **plain descriptive name, NO timestamp prefix**. They are long-lived references, not dated snapshots.
- **Change Log:** every expert doc ends with a `## Change Log` section. Use a table with the fixed header `| Time (CST) | Author | Change |`, where the timestamp column uses the format `YYYY-MM-DDTHH-MM` (CST), and the `Author` column records the agent that made the change. **Prepend new rows at the top (reverse chronological order, newest first)**. Record edits here (timestamp + author + what changed) instead of versioning the filename.
- **Update prompting:** when you repeatedly observe behavior that contradicts an expert doc, proactively remind the user whether the expert doc should be updated — point at the specific doc + what diverged. Update only on the user's go-ahead.

## Section 9. Goals (`goals/`)

`goals/` holds **temporary goal-tracking files** — the working brief + live status tracker for a multi-step effort the user hands off for (often unattended) execution.

- **Naming:** `GOAL-<CST-timestamp>.md`.
- **Lifecycle:** temporary — created when a goal is set, updated in place as goals complete, and deletable once the work is delivered and recorded elsewhere (commits, tech notes, handoffs). A live worklist, not long-term reference.
- **vs. elsewhere:** the goal *tracker* lives here; durable rationale → `tech/`; session checkpoints → `handoff/`. The goal file points at those, it doesn't duplicate them.

## Section 10. Todos (`todos/`)

`todos/` holds **rolling cross-session worklists** — the running "what's next" list, kept alive across sessions/compactions. Typically seeded from the latest handoff's "next steps" and maintained in place.

- **Naming:** `TODO-<CST-timestamp>.md`.
- **Lifecycle:** rolling — append new tasks, mark/strike completed ones; supersede with a fresh-timestamp file when stale.

## Section 11. Issues (`issues/`)

`issues/` holds **issue records** — tracked problems/decisions worth persisting outside any single session, when not using an external tracker (e.g. GitHub Issues).

- **Naming:** descriptive name, optionally with a CST timestamp prefix for one-off records (per Section 8's default).
- **vs. elsewhere:** a durable issue/decision record lives here; in-flight worklist items → `todos/`; design rationale → `tech/`. Points at them, doesn't duplicate them.

## Section 12. Document Author Attribution

- Every new document records its **authoring agent** so provenance is traceable across the multi-tool setup. Identify the tool/agent that wrote it — e.g. `Claude Code`, `Codex`, `Kiro`. Never attribute to a human unless the human actually wrote it.
- **Placement:** an `Author:` line directly under the title (e.g. `> Author: Claude Code`).
- **Do not rewrite history:** pre-existing docs without an author line are left as-is on purpose — this rule applies to new docs and substantive edits going forward, not retroactive backfill.

## Section 13. History Snapshots Are Not Rewritten

After a rename, restructure, or relocation, **do not rewrite old artifacts** (past docs, commit messages, handoffs, issues) to match the new naming/layout. Leave them as-is on purpose and read them through an explicit **old → new mapping** maintained at project level. Batch-rewriting history to "unify" terms causes broken links and noise.

## Section 14. Single Source of Truth + Drift Feedback

- For volatile facts (e.g. environment/infrastructure details), maintain **one canonical reference file** as the single source of truth, written for the AI to consult.
- **Routine/app-only changes may skip it**; **structural/infra-layer changes must be fed back** into it.
- Detection is not real-time — when you detect the file has gone stale, **prompt the user with what drifted (old → new) and ask before editing**. Do not silently rewrite it.

## Section 15. Document Extraction Rule

When using tools to read binary documents (PPT/PPTX, DOC/DOCX, PDF, XLSX), save the extracted output alongside the original:

- Text content → `<original_dir>/.output/<filename_without_ext>.md`
- Extracted images → `<original_dir>/.output/<filename_without_ext>/`

Create the `.output/` directory if it doesn't exist, so extracted content is cached for future reference without re-reading the binary.

## Section 16. Parallel Session Rules

A *parallel session* = a separate, human-launched AI session or tool instance running concurrently on an independent sub-task. It is NOT a tool's built-in sub-agent; parallel sessions are peers launched by the human, coordinating through files rather than shared memory.

### 16.1 Workspace Isolation

When a parallel session runs on an independent sub-task, it writes its deliverables into a dedicated drop folder (e.g. `.parallel-session/`), kept separate from the primary session's artifacts and out of the main workspace. Such internal/work-in-progress output stays in the internal repo and is never committed to a shared repo.

## Section 17. Multi-Increment Workflow (Spec/Skill-Driven)

> **Applicability.** This external archive-and-switch orchestration is only for skills that assume a SINGLE active working-doc folder and have no native notion of increments. If a skill already separates work by need/time on its own, do NOT impose this; let it use its own mechanism.

- **One active increment at a time.** Work lives in the active folder; when an increment is delivered, archive it and start the next with a fresh folder. The skill stays untouched and unaware.
- **Carry forward, don't re-run.** When starting a new increment, copy forward the reusable prior analysis (e.g. reverse-engineering) so staleness checks skip redundant work.
- **Increments connect through merged code, not shared docs** — each increment reads the merged code of prior increments as the handoff between them.
- **Cross-increment contracts live at project level**, not inside any single increment's working folder.
- **Respect mandatory ordering** where one increment is a prerequisite for the rest; the remaining order is set per session.
