"""Collect recent Hacker News stories using the official Firebase API."""

from __future__ import annotations

from datetime import datetime, timezone

from collectors.http import create_session, get_json
from collectors.models import RawItem

API_BASE = "https://hacker-news.firebaseio.com/v0"


def collect(limit: int = 50) -> list[RawItem]:
    session = create_session()
    story_ids = get_json(session, f"{API_BASE}/newstories.json")
    if not isinstance(story_ids, list):
        raise RuntimeError("Hacker News returned an invalid story list")

    items: list[RawItem] = []
    for story_id in story_ids[:limit]:
        story = get_json(session, f"{API_BASE}/item/{story_id}.json")
        if not isinstance(story, dict) or story.get("type") != "story" or story.get("deleted"):
            continue
        title = str(story.get("title") or "").strip()
        timestamp = story.get("time")
        if not title or not isinstance(timestamp, int):
            continue
        items.append(
            RawItem(
                source="hackernews",
                external_id=str(story_id),
                title=title,
                text=str(story.get("text") or ""),
                score=int(story.get("score") or 0),
                num_comments=int(story.get("descendants") or 0),
                created_utc=datetime.fromtimestamp(timestamp, tz=timezone.utc),
                url=str(story.get("url") or f"https://news.ycombinator.com/item?id={story_id}"),
            )
        )
    return items
