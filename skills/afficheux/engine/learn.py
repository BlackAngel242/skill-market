#!/usr/bin/env python3
"""AfficheUX: journal local de feedback explicite; aucune IA ni réseau requis."""
import argparse
import datetime as dt
import json
import uuid
from collections import Counter
from pathlib import Path

EVENTS = "events.jsonl"
POLICY = "policy.json"
SIGNALS = ("approved", "rejected", "correction")

def base(path):
    return Path(path).expanduser().resolve() / "afficheux-data"

def init(path):
    folder = base(path)
    folder.mkdir(parents=True, exist_ok=True)
    (folder / EVENTS).touch(exist_ok=True)
    policy = folder / POLICY
    if not policy.exists():
        policy.write_text('{"adopted":[],"version":1}\n', encoding="utf-8")
    return folder

def read_events(folder):
    p = folder / EVENTS
    if not p.exists():
        return []
    events = []
    for line in p.read_text(encoding="utf-8").splitlines():
        if line.strip():
            events.append(json.loads(line))
    return events

def candidates(events, minimum=2):
    confirmations = Counter()
    objections = Counter()
    for e in events:
        key = (e["scope"], e["aspect"], e["decision"])
        if e["signal"] == "approved":
            confirmations[key] += 1
        elif e["signal"] in ("rejected", "correction"):
            objections[key] += 1
    return [{"scope": a, "aspect": b, "decision": c, "support": count}
            for (a,b,c),count in sorted(confirmations.items())
            if count >= minimum and objections[(a,b,c)] == 0]

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_subparsers(dest="action", required=True)
    for action in ("init", "record", "candidates", "adopt", "stats"):
        p = actions.add_parser(action)
        p.add_argument("--workspace", required=True)
        if action == "record":
            for k in ("project", "scope", "aspect", "decision", "reason"):
                p.add_argument("--" + k, required=True)
            p.add_argument("--signal", choices=SIGNALS, required=True)
        if action == "candidates":
            p.add_argument("--min-support", type=int, default=2)
        if action == "adopt":
            for k in ("scope", "aspect", "decision"):
                p.add_argument("--" + k, required=True)
            p.add_argument("--confirm", action="store_true")
    args = parser.parse_args(argv)
    folder = base(args.workspace)
    if args.action == "init":
        print(json.dumps({"workspace": str(init(args.workspace))}))
        return 0
    if not folder.exists():
        parser.error("Mémoire absente. Exécuter init dans un emplacement autorisé.")
    if args.action == "record":
        entry = {"id":str(uuid.uuid4()), "at":dt.datetime.now(dt.timezone.utc).isoformat(),
                 "project":args.project,"scope":args.scope,"aspect":args.aspect,
                 "decision":args.decision,"reason":args.reason,"signal":args.signal}
        if any(not str(entry[k]).strip() for k in ("project","scope","aspect","decision","reason")):
            parser.error("Les champs texte doivent être remplis.")
        with (folder / EVENTS).open("a",encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False)+"\n")
        print(json.dumps({"recorded":entry["id"],"signal":entry["signal"]}))
        return 0
    events = read_events(folder)
    if args.action == "candidates":
        if args.min_support < 2:
            parser.error("Le seuil minimal de confirmation est 2.")
        print(json.dumps(candidates(events,args.min_support),ensure_ascii=False,indent=2))
    elif args.action == "adopt":
        if not args.confirm:
            parser.error("Adoption interdite sans --confirm et accord explicite de l'utilisateur.")
        selected = (args.scope, args.aspect, args.decision)
        if selected not in {(c["scope"],c["aspect"],c["decision"]) for c in candidates(events)}:
            parser.error("Règle non confirmée par deux retours cohérents.")
        path = folder / POLICY
        policy = json.loads(path.read_text(encoding="utf-8"))
        rec = {"scope":args.scope,"aspect":args.aspect,"decision":args.decision}
        if rec not in policy["adopted"]:
            policy["adopted"].append(rec)
            path.write_text(json.dumps(policy,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(json.dumps({"adopted":rec},ensure_ascii=False))
    elif args.action == "stats":
        print(json.dumps({"events":len(events),"signals":dict(Counter(e["signal"] for e in events)),
                          "candidates":len(candidates(events))},ensure_ascii=False))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
