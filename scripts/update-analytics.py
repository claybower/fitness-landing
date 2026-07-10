#!/usr/bin/env python3
"""Regenerate analytics.json for claybower.com/ugc.html from the live dashboard feed.
Run:  python3 scripts/update-analytics.py   (from the fitness-landing repo root)
Then commit + push analytics.json so Vercel redeploys with fresh numbers.

Powers the interactive stats dashboard (platform toggle + 30d/90d period toggle).
"""
import json, os, datetime

DASH = os.path.expanduser("~/Claude Code/dashboard/dashboard-data.json")
OUT = os.path.join(os.path.dirname(__file__), "..", "analytics.json")

with open(DASH) as f:
    s = json.load(f).get("social", {})

ig, tk, yt = s.get("instagram", {}), s.get("tiktok", {}), s.get("youtube", {})


def pv(p, k):
    return (p.get("period_views") or {}).get(k)


def pf(p, k):
    return (p.get("period_followers") or {}).get(k)


def avg(lst, key):
    vals = [x.get(key, 0) or 0 for x in (lst or [])]
    vals = [v for v in vals if v]
    return sum(vals) / len(vals) if vals else 0


# Instagram engagement rate from recent top posts
igm = ig.get("top_media", [])
ig_eng = round((avg(igm, "likes") + avg(igm, "comments")) / (ig.get("followers", 0) or 1) * 100, 1)

ig_f = ig.get("followers", 0)
tk_f = tk.get("followers", 0)
yt_f = yt.get("subscribers", 0)


def combined(k):
    a, b, c = pf(ig, k) or 0, pf(tk, k) or 0, pf(yt, k) or 0
    return a + b + c


def combined_views(k):
    return (pv(ig, k) or 0) + (pv(yt, k) or 0)   # TikTok period-views not exposed by API


# Manually-maintained business metrics (not from a live API — edit here to update)
MANUAL_PARTNERS = "25+"
MANUAL_REVENUE = "$50K+"

data = {
    "updated": datetime.date.today().isoformat(),
    "all": {
        "label": "All Platforms",
        "audience": ig_f + tk_f + yt_f,
        "content": ig.get("media_count", 0) + tk.get("video_count", 0) + yt.get("video_count", 0),
        "likes": tk.get("likes_count", 0),
        "partners": MANUAL_PARTNERS,
        "revenue": MANUAL_REVENUE,
        "growth": {"30d": combined("30d"), "90d": combined("90d")},
        "reach": {"30d": combined_views("30d"), "90d": combined_views("90d")},
    },
    "instagram": {
        "label": "Instagram", "handle": "@clayb0wer", "url": "https://instagram.com/clayb0wer",
        "followers": ig_f, "followers_label": "Followers",
        "content": ig.get("media_count", 0), "engagement": ig_eng,
        "growth": {"30d": pf(ig, "30d"), "90d": pf(ig, "90d")},
        "reach": {"30d": pv(ig, "30d"), "90d": pv(ig, "90d")},
    },
    "tiktok": {
        "label": "TikTok", "handle": "@clayjbower", "url": "https://tiktok.com/@clayjbower",
        "followers": tk_f, "followers_label": "Followers",
        "content": tk.get("video_count", 0), "likes": tk.get("likes_count", 0),
        "growth": {"30d": pf(tk, "30d"), "90d": pf(tk, "90d")},
        "reach": {"30d": None, "90d": None},
    },
    "youtube": {
        "label": "YouTube", "handle": "@clayjbower", "url": "https://youtube.com/@clayjbower",
        "followers": yt_f, "followers_label": "Subscribers",
        "content": yt.get("video_count", 0), "total_views": yt.get("total_views", 0),
        "avg_views": yt.get("avg_views_per_video", 0),
        "growth": {"30d": pf(yt, "30d"), "90d": pf(yt, "90d")},
        "reach": {"30d": pv(yt, "30d"), "90d": pv(yt, "90d")},
    },
}

# Audience demographics (Instagram) — only included once the demographics
# pull has run (refresh-instagram-demographics.py). Absent until then.
demo = ig.get("demographics")
if demo:
    data["demographics"] = {
        "source": "Instagram",
        "age": demo.get("age"),
        "gender": demo.get("gender"),
        "country": demo.get("country"),
        "city": demo.get("city"),
    }

with open(OUT, "w") as f:
    json.dump(data, f, indent=2)
print("Wrote", os.path.abspath(OUT))
print(json.dumps(data, indent=2))
