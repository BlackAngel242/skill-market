---
name: uxfix
description: "Fixe automatiquement les défauts UI détectés : boucle détecter → corriger → revérifier jusqu'à un score de 99/100. Contrastes WCAG, halos colorés, easings rebond, interlettrage, palettes IA, copy marketing."
---

# UxFix: autonomous UX fixing loop

## Purpose

Don't just report UI defects: fix them alone, re-verify, and loop until the score reaches 99/100. The `impeccable` detector provides the analysis (findings + severity); UxFix applies the mechanical corrections and iterates. The agent supervises; the machine does the rounds.

## Tooling

Engine: `<skill-dir>/engine/uxfix.js` (Node, no dependencies). Detector: the `impeccable` binary (installed globally by `market install uxfix`).

```bash
node <skill-dir>/engine/uxfix.js <fichier-ou-dossier> [--target 99] [--max-iterations 6] [--dry-run] [--json]
```

`IMPECCABLE_BIN` env overrides the detector path. `--dry-run` previews fixes without writing. `--json` emits a machine-readable report.

## Workflow

1. **Run** `uxfix` on the built UI files (single HTML/CSS file or directory). It scans `.css` files and `<style>` blocks in HTML.
2. **Read the report**: score progression per iteration, fixes applied, manual remainder.
3. **Handle the manual remainder yourself**: findings with no auto-fixer (unknown rules, brand palette choices the engine neutralized, copy the dictionary missed) need human judgment.
4. **Originals are safe**: before the first write, everything is copied to `.uxfix-backup/<timestamp>/` next to the target.

## The 99% contract

- Score = 100 − 1 per unique warning − 5 per unique error. Duplicates of the same finding count once. Advisories are informational and don't count (same as the detector's own failure semantics).
- 99+ means zero primary findings, or a single trivial warning left.
- The loop keeps fixing while the fixers make progress (max 6 iterations), then reports what's left instead of churning.

## Auto-fix catalog

| Finding | Automatic fix |
|---|---|
| `low-contrast` | Recomputes the offending color with real WCAG math (binary search toward black/white) until the required ratio is met; touches only the `color`/`background` declarations involved |
| `gradient-text` | Replaces the gradient with its darkest stop as a solid color; removes `background-clip: text` |
| `dark-glow` | Zero-offset chromatic `box-shadow` → neutral elevation shadow; chromatic `text-shadow` → `none` |
| `wide-tracking` | `letter-spacing` above 0.05em → `0.02em` (`0.04em` for uppercase labels) |
| `cream-palette` | Flagged warm page background → `#ffffff` |
| `ai-color-palette` | Violet/purple hues (265–300°) rotated toward blue, saturation/lightness kept |
| `bounce-easing` | `cubic-bezier` with overshoot → `cubic-bezier(0.4, 0, 0.2, 1)` |
| `pulsing-dot` | Infinite pulse animation on the flagged dot → `animation: none` |
| `marketing-buzzword` | Dictionary rewrite of EN/FR buzzwords in HTML text nodes (scripts, styles, code blocks untouched) |

Details and limits per rule: `references/fix-catalog.md`. Scoring details: `references/scoring.md`.

## Operating rules

- Run on the real built files, not on mockups: the detector resolves computed styles.
- Palette changes (`ai-color-palette`, `cream-palette`) are applied with safe neutrals but **must be flagged for human review**: brand colors are a choice, not a bug. The report lists every one.
- Copy rewrites use a fixed dictionary; nuanced marketing copy still deserves a human pass.
- A 100/100 detector score is defect evidence, not proof of good design. Keep taste in the loop: run the loop, then look at the page.
- Never run with `--target 100` as a hard gate in CI unless a human reviews the diff: the last point is sometimes a judgment call.
