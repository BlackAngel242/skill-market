# Lentille sécurité : 3 questions par phase

La sécurité ne vit pas qu'en phase 7. À chaque phase, poser les trois questions
et tracer les réponses quand elles changent quelque chose.

1. **Quelles données sensibles apparaissent ou bougent ici ?**
   (personnelles, financières, d'authentification, métier confidentiel)
2. **Quelle surface d'attaque s'ouvre ou s'agrandit ?**
   (nouveau point d'entrée, nouveau rôle, nouvelle intégration, nouveau fichier)
3. **Que se passe-t-il en cas de fuite, d'abus ou d'indisponibilité ?**
   (impact, détection, récupération)

## Application par phase

- **Phase 1 (cadrage)** : inventorier les données sensibles dès le départ ; elles
  influencent le niveau `RENFORCÉ` et la composition de la table ronde.
- **Phase 2 (table ronde)** : activer le regard sécurité/pentester dès qu'une
  réponse à Q1 ou Q2 est non vide (le conditionnel de `personas.md` devient
  un déclencheur explicite).
- **Phase 4 (arbitrages)** : toute décision qui augmente la surface d'attaque
  porte sa contrepartie sécurité dans le Decision Log.
- **Phase 5 (PRD)** : exigences non fonctionnelles de sécurité formulées en
  comportements observables, pas en adjectifs (« les mots de passe sont hachés
  en argon2id », pas « authentification sécurisée »).
- **Phase 6 (stories)** : les AC des stories sensibles incluent le cas d'abus
  (tentative d'accès non autorisé, injection, rejeu).
- **Phase 7 (architecture)** : threat modeling léger sur les flux critiques ;
  sauvegarde, reprise, journalisation et détection proportionnées au niveau.
- **Phase 8 (lots)** : le premier lot vertical inclut le socle sécu
  (auth, gestion des secrets, logs) ; jamais « on verra plus tard ».
- **Phase 9 (contrôle)** : la revue finale vérifie que chaque réponse Q1/Q2/Q3
  a une réponse traçable dans le PRD.

Si les trois réponses sont « rien / aucune / sans objet » sur toutes les phases,
le noter une fois en phase 1 et ne pas répéter le rituel à vide.
