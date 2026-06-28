"""Canonical serialisation reference for kappa-labels and the group seal.
Rule (per 0xagentprivacy canon): sorted keys, compact separators, kappa field
excluded from its own hash input, UTF-8. Third-party verifiers MUST match this
exactly or they will produce false negatives.
"""
import json, hashlib

def canonical(obj: dict, exclude=("kappa", "seal", "vrcId", "gameId")) -> bytes:
    pruned = {k: v for k, v in obj.items() if k not in exclude}
    return json.dumps(
        pruned, sort_keys=True, separators=(",", ":"), ensure_ascii=False
    ).encode("utf-8")

def kappa(vrc: dict) -> str:
    return hashlib.sha256(canonical(vrc)).hexdigest()

def group_seal(kappa_labels: list[str], geometry_hash: str) -> str:
    body = {"kappaLabels": sorted(kappa_labels), "geometryHash": geometry_hash}
    return hashlib.sha256(canonical(body)).hexdigest()

if __name__ == "__main__":
    demo = {"vrcId":"x","slotId":"compute.head","axisId":"compute","polarity":"+",
            "proverb":"i advise the seeing so the building can begin","issuedAt":"2026-06-27T00:00:00Z"}
    print("kappa:", kappa(demo))
