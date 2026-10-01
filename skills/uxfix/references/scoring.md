# UxFix scoring

## Formula

```
score = max(0, 100 − 1 × warnings − 5 × errors)
```

- Findings are deduplicated by `antipattern + snippet`: the same issue reported three times costs one point, not three.
- `advisory` findings (e.g. `em-dash-overuse`) are listed in the report but never counted, mirroring the detector's own rule that advisories are not failures.

## What the numbers mean

| Score | Meaning |
|---|---|
| 100 | Zero primary findings. |
| 99 | One trivial warning left. The loop's target: effectively clean. |
| 90–98 | A handful of warnings left; the loop keeps going while fixers make progress. |
| < 90 | Several distinct issues; expect 2–4 iterations. |

## Loop behavior

1. Detect → score. If 100, stop.
2. If score ≥ target (default 99) and the previous iteration applied no fixes, stop: target reached.
3. Apply one fixer pass per unique finding, write files, re-detect.
4. Stop early when two consecutive iterations produce the identical finding set without score improvement (no churn), or after 6 iterations.
5. Anything left is reported under "Reste à traiter manuellement" with the rule name and snippet.

## Why 99 and not 100

The last point is sometimes a judgment call (a brand purple, a deliberate cream, copy nuance). 99 means "the machine did everything mechanical"; 100 means "nothing left at all". The loop aims for 100 whenever the fixers can get there, and never pretends a manual remainder doesn't exist.
