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


def pv(p, k):
    return (p.get("period_views") or {}).get(k, 0) or 0


def pf(p, k):
    return (p.get("period_followers") or {}).get(k, 0) or 0


def avg(lst, key):
    vals = [x.get(key, 0) or 0 for x in (lst or [])]
    vals = [v for v in vals if v]
    return sum(vals) / len(vals) if vals else 0


# Instagram engagement, computed from recent top posts
igm = ig.get("top_media", [])
ig_avg_likes = avg(igm, "likes")
ig_avg_comments = avg(igm, "comments")
ig_followers = ig.get("followers", 0) or 1
ig_engagement = round((ig_avg_likes + ig_avg_comments) / ig_followers * 100, 1)

total = ig.get("followers", 0) + tk.get("followers", 0) + yt.get("subscribers", 0)

data = {
    "updated": datetime.date.today().isoformat(),
    "total": total,
    # combined
    "growth_30d": pf(ig, "30d") + pf(tk, "30d") + pf(yt, "30d"),
    "growth_90d": pf(ig, "90d") + pf(tk, "90d") + pf(yt, "90d"),
    "reach_30d": pv(ig, "30d") + pv(yt, "30d"),   # IG + YT (TikTok view API n/a)
    "reach_90d": pv(ig, "90d") + pv(yt, "90d"),
    "content_total": (ig.get("media_count", 0) + tk.get("video_count", 0) + yt.get("video_count", 0)),
    "lifetime_likes": tk.get("likes_count", 0),
    "ig_engagement": ig_engagement,
    "ig_avg_likes": round(ig_avg_likes),
    "yt_avg_views": yt.get("avg_views_per_video", 0),
    "instagram": {
        "followers": ig.get("followers"),
        "weekly": ig.get("weekly_delta"),
        "growth_90d": pf(ig, "90d"),
        "reach": pv(ig, "30d"),
        "reach_label": "Views · 30d",
    },
    "tiktok": {
        "followers": tk.get("followers"),
        "weekly": tk.get("weekly_delta"),
        "growth_90d": pf(tk, "90d"),
        "reach": tk.get("likes_count"),
        "reach_label": "Total likes",
    },
    "youtube": {
        "followers": yt.get("subscribers"),
        "weekly": yt.get("weekly_delta"),
        "growth_90d": pf(yt, "90d"),
        "reach": yt.get("total_views"),
        "reach_label": "Total views",
    },
}

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)
print("Wrote", os.path.abspath(OUT))
print(json.dumps(data, indent=2))
