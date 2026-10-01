---
name: impeccable
description: "Detect and remove AI slop from any UI you build: scan HTML/CSS for AI tells (cream palettes, purple gradients, buzzword copy, italic serif, pulsing dots) and apply design playbooks (polish, critique, typeset, layout, clarify, new-work). Use whenever you build, edit, or deliver a frontend surface: web artifact, widget, landing page, dashboard, report page."
---

# Impeccable: design QA for agents

## Purpose

Catch the visual and copy defaults agents reach for before they ship. Run the detector on every UI deliverable, fix findings in one batch, and use the reference playbooks when doing design work beyond a quick scan.

## Tooling

Local binary (pinned, no network needed for detection):

```
impeccable
```

Scan a file, directory, or URL:

```
impeccable detect <path-or-url>
```

The detector runs in code, no AI model, no API key. Typical findings: `low-contrast` (WCAG AA), `cream-palette` (safe warm off-white), `ai-color-palette` (purple/violet gradients, cyan-on-dark), `marketing-buzzword` (tapestry of seamless experiences, empower, supercharge...), plus clipped labels, italic serif tells, pulsing dots, side tabs.

Manage ignore rules when a finding is a deliberate brand choice:

```
.../impeccable ignores --help
```

## Workflow

1. **After building or editing any UI** (artifact, widget HTML, report page, landing page): run `detect` on the built files before delivering.
2. **Fix every real finding in one batch.** Classify first: broken/blocked tasks and misleading states first, then missing states (loading/empty/error/disabled), then hierarchy and drift, then cosmetic. Do not perfect one corner while the rest is below bar.
3. **For deeper design work**, read the playbook in `references/` before editing:
   - `craft-floor.md`: quality floor and absolute bans, read right before any UI edit.
   - `polish.md`: final quality pass on an existing surface, preserves the incumbent visual world.
   - `critique.md`: heuristic UX review with scoring.
   - `new-work.md`: new surface or replacement visual world.
   - `typeset.md` / `layout.md` / `clarify.md`: targeted fixes for typography, spacing/hierarchy, UX copy.
4. **Verify the rendered result** in a browser (desktop and mobile) after the fix pass. A clean detector scan is defect evidence, not proof of quality.

## Operating Rules

- Always run the detector before handing a UI to the user, not after they complain.
- The brief wins: a pinned brand choice (even a cream background or purple accent the client insists on) overrides a saturated-pattern warning. Record deliberate exceptions, do not fight the user over them.
- Refinement preserves; redesign replaces. Never smuggle a redesign into a polish pass. If the concept itself is wrong, say so plainly.
- Never add animation or decoration just to make polish visible.
- Keep French copy free of AI slop too: no empty buzzwords, no "plongez dans", no grand claims. Say what the product literally does.
- If the detector binary fails, fall back to the craft-floor checklist in `references/craft-floor.md` manually.
