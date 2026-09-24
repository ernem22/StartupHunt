"""Collect hot posts from public subreddit JSON feeds."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable
from xml.etree import ElementTree

from collectors.http import create_session, get_json
from collectors.models import RawItem


def collect(subreddits: Iterable[str], limit: int = 50) -> list[RawItem]:
    subreddit_list = tuple(subreddits)
    session = create_session()
    per_subreddit = max(1, min(100, limit // max(1, len(subreddit_list))))
    items: list[RawItem] = []

    for subreddit in subreddit_list:
        try:
            payload = get_json(
                session,
                f"https://old.reddit.com/r/{subreddit}/hot.json",
                params={"limit": per_subreddit, "raw_json": 1},
            )
        except Exception as json_error:
            try:
                items.extend(_collect_rss(session, subreddit, per_subreddit))
                continue
            except Exception as rss_error:
                raise RuntimeError(
                    f"Reddit JSON and RSS both failed for r/{subreddit}: {rss_error}"
                ) from json_error
        if not isinstance(payload, dict):
            continue
        children = payload.get("data", {}).get("children", [])
        if not isinstance(children, list):
            continue
        for child in children:
            data = child.get("data", {}) if isinstance(child, dict) else {}
            created = data.get("created_utc")
            title = str(data.get("title") or "").strip()
            post_id = data.get("id")
            if not title or not post_id or not isinstance(created, (int, float)):
                continue
            permalink = str(data.get("permalink") or "")
            items.append(
                RawItem(
                    source="reddit",
                    external_id=str(post_id),
                    title=title,
                    text=str(data.get("selftext") or ""),
                    score=int(data.get("score") or 0),
                    num_comments=int(data.get("num_comments") or 0),
                    created_utc=datetime.fromtimestamp(created, tz=timezone.utc),
                    url=f"https://www.reddit.com{permalink}" if permalink else data.get("url"),
                )
            )
    return items[:limit]


def _collect_rss(session: object, subreddit: str, limit: int) -> list[RawItem]:
    """Use Reddit's public Atom feed when JSON requests require a login."""
    response = session.get(  # type: ignore[union-attr]
        f"https://www.reddit.com/r/{subreddit}/hot.rss",
        headers={"Accept": "application/atom+xml"},
        timeout=20,
    )
    response.raise_for_status()
    root = ElementTree.fromstring(response.content)
    atom = "{http://www.w3.org/2005/Atom}"
    items: list[RawItem] = []
    for entry in root.findall(f"{atom}entry")[:limit]:
        identifier = (entry.findtext(f"{atom}id") or "").rsplit("/", maxsplit=1)[-1]
        title = (entry.findtext(f"{atom}title") or "").strip()
        published = entry.findtext(f"{atom}published") or entry.findtext(f"{atom}updated")
        content = entry.find(f"{atom}content")
        link = next(
            (
                element.attrib.get("href")
                for element in entry.findall(f"{atom}link")
                if element.attrib.get("rel", "alternate") == "alternate"
            ),
            None,
        )
        if not identifier or not title or not published:
            continue
        items.append(
            RawItem(
                source="reddit",
                external_id=identifier,
                title=title,
                text=(content.text or "") if content is not None else "",
                score=None,
                num_comments=None,
                created_utc=datetime.fromisoformat(published.replace("Z", "+00:00")),
                url=link,
            )
        )
    return items
