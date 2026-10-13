---
name: merge-gate
description: "Checklist avant fusion : base à jour, vérifications au vert, commit relu épinglé, pas de force push. Verdict GO / NO-GO motivé."
---

# Merge-Gate : la checklist avant de fusionner

Adapté du `merge gate` et de `guard-protected-push` par EricTechPro (super-board, MIT).

Une fusion n'a lieu que si toutes les conditions sont réunies. Ce skill est la checklist, pas la fusion elle-même : il rend un verdict motivé, il ne merge pas.

## La checklist

Vérifier dans l'ordre, s'arrêter au premier échec :

1. **Base à jour.** La branche est-elle rebasée ou mergée sur la base actuelle (main/master) ? Une branche en retard de plus de quelques commits = NO-GO, rebaser d'abord.
2. **Vérifications au vert.** Les `verify_commands` du projet (tests, lint, build) passent-ils sur le commit candidat ? Preuve exigée : sortie réelle, pas une affirmation.
3. **Commit épinglé.** Le commit relu est-il exactement celui qu'on fusionne ? Tout nouveau commit depuis la relecture impose une nouvelle relecture.
4. **Relecture faite.** Une relecture humaine (ou du rôle désigné) a-t-elle approuvé ce commit précis ? Pas de relecture = NO-GO, sauf procédure d'urgence documentée.
5. **Pas de force push.** La fusion ne doit ni forcer ni réécrire l'historique de la branche protégée. Branches protégées (main, master, production) : fusion par merge ou squash via PR uniquement.
6. **Migrations autorisées.** Si la PR contient des migrations de base de données, sont-elles dans la liste des migrations autorisées et réversibles ?

## Verdict

- **GO** : toutes les conditions sont réunies. Préciser le commit exact fusionnable.
- **NO-GO** : lister chaque condition en échec et l'action pour la lever.

Un NO-GO n'est pas un échec : c'est la gate qui fait son travail.
