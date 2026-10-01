# Manifeste machine : spec.json

Le Markdown est fait pour les humains. Pour transmettre le cadrage à un agent de
code sans perte ni hallucination, générer `spec.json` : le même contenu, structuré,
avec les IDs comme clés de liaison.

## Schéma minimal

```json
{
  "projet": "nom",
  "niveau": "LEGER | STANDARD | RENFORCE",
  "gate": "GO | PIVOT | NO-GO",
  "hypotheses": [
    {"id": "HYP-001", "enonce": "...", "risque": "eleve|moyen|faible",
     "experience": "...", "statut": "a_tester|confirmee|invalidee"}
  ],
  "decisions": [
    {"id": "DEC-001", "titre": "...", "decision": "...", "pourquoi": "...",
     "contrepartie": "...", "statut": "CONFIRME|HYPOTHESE|A_VALIDER|BLOQUANT",
     "approver": "...", "revoir_si": "...", "hypotheses": ["HYP-001"]}
  ],
  "stories": [
    {"id": "US-001", "titre": "...", "en_tant_que": "...",
     "je_veux": "...", "afin_de": "...",
     "decisions": ["DEC-001"],
     "acceptation": [
       {"id": "AC-001", "critere": "...", "instrumentation": "... ou null"}
     ],
     "dor_ok": true}
  ],
  "lots": [
    {"id": "LOT-1", "titre": "...", "stories": ["US-001"],
     "estimation_jh": {"o": 3, "m": 5, "p": 9},
     "dependances": [], "dod_ok": false}
  ],
  "metriques": [
    {"nom": "...", "cible": "...", "horizon": "...", "source": "..."}
  ]
}
```

## Règles

- `spec.json` est **généré depuis** le PRD, jamais l'inverse. En cas de divergence,
  le PRD Markdown fait foi jusqu'à régénération.
- Générer `spec.json` dès STANDARD quand un agent doit coder ; optionnel en LÉGER.
- Ne jamais y mettre de secret (voir `pillar-files.md`).
- Valider : tout ID référencé existe ; toute US critique a au moins un AC ;
  tout lot a une estimation ; le gate est renseigné.
