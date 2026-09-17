# SOUL Change Log

Revision history for [SOUL.md](#soul). Kept out of SOUL's body so the constitution stays pure (injected verbatim into every tool). Reverse chronological — newest first; the bottom entry is the earliest record.

## 2026-06-20T19-50 · Claude Code

- **Section 2.1 reframed from a fixed map to a topology pointer.** Retitled "Design vs. Shippable Code" → "Content Ownership: Follows the Project's Repo Topology".
- The old two-way split (process/design → parent; shippable code → child) silently assumed a fixed repo shape and left a gap: process/tooling scripts a project writes for its *own* work (e.g. analysis/automation one-offs) read as "code" and risked being pushed toward a child repo.
- The new form makes ownership *follow the project's actual git topology*, established at SOUL-injection time and recorded as the project's single source of truth (Section 14): which repos exist, each one's visibility, and parent/child relationships — including `.gitignore`-excluded nested child repos.
- **Probe what is observable (`git remote`, visibility, gitignored nested repos), ask the user only for intent (future child split, deliberate-vs-temporary public).** Existing projects are surveyed, not forced.
- Until topology is recorded, safe defaults apply: design/process material **and tooling/analysis scripts** stay private in the parent; only outward-facing deliverable code goes to its repo.

## 2026-06-14T14-43 · Claude Code

- Rewrote the three opening meta-rules as `First Law — English Only` / `Second Law — Supremacy` / `Third Law — Changelog Externalized`.
- Numbered all body sections `Section 1.` … `Section 15.` in existing order, with sub-sections `2.1` and `5.1` (top level carries the word `Section` + trailing period; sub-levels carry the number only).
- [SOUL.naming-convention.md](#naming): added a "Two tiers: Laws (meta) and Sections (body)" section defining the Law/Section split and the `Zeroth Law` escape hatch; fixed heading-mapping examples to the adopted form (`## Section N.` / `### N.M`); recorded that the convention was applied to SOUL's body on this date as the no-renumber baseline.

## 2026-06-14T14-36 · Claude Code

- Added a preamble: states SOUL's purpose and the governance model — human legislates, AI is sole scribe (human does not hand-edit), AI never edits SOUL on its own initiative but may propose changes; "AI proposes → human decides → AI writes".
- Added section "Injection-Entry Files Are Frozen": the three cross-tool injection entries (`.kiro/steering/kiro-instructions.md`, `CLAUDE.md`, `AGENTS.md`) must not be renamed/moved/deleted/content-edited or have their target changed, unless the user instructs otherwise.

## 2026-06-13T17-36 · Claude Code

- Changed the changelog format from a markdown table to a list (`## <timestamp> · <Author>` heading + bullets), following the Keep a Changelog convention. Avoids pipe-escaping and fits longer, multi-line descriptions. Updated SOUL rule 3 to specify this list format.

## 2026-06-13T17-28 · Claude Code

- Added rule 3: SOUL's own revision history is externalized to the sibling file `SOUL.changelog.md` (SOUL body stays pure, no embedded change log); every SOUL change must append an entry there.
