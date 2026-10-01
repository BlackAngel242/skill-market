# UxFix fix catalog

How each detector finding is corrected automatically, and where the automation stops.

## low-contrast

Snippet format: `2.6:1 (need 4.5:1) — text #ffffff on #ff7a00`.

The fixer parses both colors, computes real WCAG relative luminance, and picks which side to move:
- near-white text → darken the background
- near-white background → darken the text
- near-black text → lighten the background
- near-black background → lighten the text
- otherwise → darken the lighter of the two

It binary-searches the smallest mix toward black (or white) that reaches the required ratio plus a 0.05 margin. If one side alone can't reach it, the other side is pushed toward the opposite extreme (black vs white always gives 21:1, so it always converges).

Only the `color` / `background` / `background-color` declarations carrying the exact flagged colors are touched. The rest of the palette is left alone.

## gradient-text

Rules using `background-clip: text` with a gradient: the gradient is removed, the darkest gradient stop becomes the solid `color`, and the transparent-ink declarations (`-webkit-text-fill-color`, `background-clip`) are deleted. The element keeps its inherited background. A contrast pass usually follows in the next iteration.

## dark-glow

`box-shadow` with zero x/y offset and a chromatic color (saturation > 0.12) → `0 1px 3px rgba(0,0,0,0.12)`. Chromatic `text-shadow` → `none`. Neutral shadows are never touched.

## wide-tracking

Any `letter-spacing` above 0.05em (px converted at 16px base, matching the detector) → `0.02em`, or `0.04em` when the same rule sets `text-transform: uppercase`. Both are under every observed detector threshold.

## cream-palette

The exact flagged warm background (`rgb(250, 246, 239)` in the snippet, plus its hex twin) → `#ffffff`. Only page backgrounds the detector flagged are replaced, not every warm tint in the design system.

## ai-color-palette

The snippet carries no color value, so the fixer scans every color token: hue 265–300° with saturation above 0.25 is rotated to hue 222° (blue), keeping saturation (capped at 0.75) and lightness. Structure of the design is preserved; the "AI tell" hue is not.

**Limit: this is a judgment call the machine makes alone.** Every rotation is listed in the report and must be reviewed. If purple is the brand, waive the rule with an inline ignore instead.

## bounce-easing

`cubic-bezier(a,b,c,d)` with b or d outside [0,1] (the overshoot that reads as "bounce") → `cubic-bezier(0.4, 0, 0.2, 1)`, the standard ease. Timing and duration are untouched.

## pulsing-dot

Snippet format: `.dot — 8x8px dot with infinite "blink" animation`. The fixer parses the selector and animation name, then sets `animation: none` on that exact selector. The `@keyframes` block is left in place (harmless).

## marketing-buzzword

The snippet truncates the phrase (`1 buzzword phrase: "Supercharge your productivit"`), so the fixer doesn't rely on it: it rewrites known EN/FR buzzwords across HTML text nodes using a fixed dictionary (`references/buzzwords.md`), skipping `<script>`, `<style>`, `<code>`, `<pre>`, `<textarea>` and all attributes. Case of the original word is preserved. The next detection pass verifies; anything still flagged is reported for a human rewrite.

## Not auto-fixed (reported for manual review)

`clipped-labels`, `italic-serif`, `side-tabs`, and any rule the engine doesn't know: they need eyes and context. The loop lists them with their snippet instead of guessing.
