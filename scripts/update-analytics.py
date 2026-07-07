#!/usr/bin/env python3
"""Regenerate analytics.json for claybower.com/ugc.html from the live dashboard feed.
Run:  python3 scripts/update-analytics.py   (from the fitness-landing repo root)
Then commit + push analytics.json so Vercel redeploys with fresh numbers.
"""
import json, os, datetime

DASH = os.path.expanduser("~/Claude Code/dashboard/dashboard-data.json")
OUT = os.path.join(os.path.dirname(__file__), "..", "analytics.json")

with open(DASH) as f:
    s = json.load(f).get("social", {})

ig, tk, yt = s.get("instagram", {}), s.get("tiktok", {}), s.get("youtube", {})

def views30(p):
    return (p.get("period_views") or {}).get("30d")

data = {
    "updated": datetime.date.today().isoformat(),
    "total": (ig.get("followers", 0) + tk.get("followers", 0) + yt.get("subscribers", 0)),
    "instagram": {
        "followers": ig.get("followers"),
        "weekly": ig.get("weekly_delta"),
        "reach": views30(ig),
        "reach_label": "Views · 30d",
    },
    "tiktok": {
        "followers": tk.get("followers"),
        "weekly": tk.get("weekly_delta"),
        "reach": tk.get("likes_count"),
        "reach_label": "Total likes",
    },
    "youtube": {
        "followers": yt.get("subscribers"),
        "weekly": yt.get("weekly_delta"),
        "reach": yt.get("total_views"),
        "reach_label": "Total views",
    },
}

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)
print("Wrote", os.path.abspath(OUT))
print(json.dumps(data, indent=2))
