# SOUL Naming & Numbering Convention

This file defines how the sections of [SOUL.md](#soul) are numbered and referenced. It is kept as a sibling file — NOT inside SOUL's body — for the same reason as [SOUL.changelog.md](#changelog): SOUL is injected verbatim into every tool, so its body stays pure (hard constraints only), while the detailed explanation of *how it is structured* lives here.

SOUL itself need not be injected with this convention; agents consult this file when **editing** SOUL, not when **following** it.

## 1. Why numbering at all

References to SOUL rules — from SOUL's own cross-references, from expert docs, handoffs, changelog entries, and from this review process — must survive a section title being reworded.

A stable number is the durable anchor; the title is the human-readable label. Cite both where it helps (number for stability, title for readability).

## 2. Two tiers: Laws (meta) and Sections (body)

- **Meta-rules → `First / Second / Third Law`** (ordinal words spelled out, each with a short subtitle, e.g. `## First Law — English Only`). These are the supreme rules governing SOUL itself (language, supremacy, changelog externalization).
- **Body rules → `Section N`** (decimal, see below). The ordinary project/behavior rules.
- Reference a meta-rule as **"the First Law"** (not "rule 1"); reference a body rule as **"Section N"**.

**Folder-governing Sections.** A Section that governs a top-level working folder mirrors that folder's hierarchy: the folder is a Section, and its sub-folders are sub-sections (e.g. `tech/` → Section 8, `tech/expert/` → 8.1). The Project File Layout Section keeps the canonical tree and points each folder at its Section; adding a new folder type = register it there + append a new Section at the end (never renumber).

## 3. Section numbering

- **Decimal, hierarchical, at most THREE levels:** `N`, `N.M`, `N.M.K` — e.g. `2`, `2.1`, `2.1.1`. Never go deeper than three levels.
- **Heading mapping:** the number is written into the heading text.
  - Level 1 → `## Section N. Title`.
  - Level 2 → `### N.M Title`.
  - Level 3 → `#### N.M.K Title`.
- Every numbered unit carries **both a number and a title**.

## 4. How to reference a section

- Use the word **`Section`, written out in full**: "see Section 2.1", "per Section 2.1 (Content Ownership)".
- **Do NOT abbreviate** (no `Sec.`, no `S2.1`). Always the full word `Section`.
- Plural: "Sections 2 and 5".

## 5. Inserting new content — numbers are NEVER renumbered

Once a number is assigned, it is permanent. Inserting a new rule must never shift any existing number (that would silently break every reference pointing at the old numbers).

- **Append at the end** when the new material is genuinely new top-level content: it takes the next free number.
- **Patch-insert with a letter suffix `(A)`** when the new clause logically belongs *between* two existing ones. Attach `(A)`, `(B)`, `(C)` … (in insertion order) to the **preceding** number, at any level:
  - after `2` → `2(A)`
  - after `2.1` → `2.1(A)`
  - after `2.1.1` → `2.1.1(A)`
- **Physical placement = logical position.** A patch sits where it reads correctly — `2.1(A)` is written between `2.1` and `2.2` in the file — so reading order matches logical order, while every existing number stays untouched.
- **No patch on a patch.** Keep to a single letter level; do not write `2.1(A)(B)` or `2.1(A).1`.

## 6. Deprecating a section

Do not delete a number to free it up. A retired rule **keeps its number, marked deprecated** — e.g. `## Section 7. <title> (deprecated)` — so existing references never dangle.

The number is never reassigned to different content. (Same for a Law: a retired Law keeps its slot, marked deprecated; never reassign it.)
