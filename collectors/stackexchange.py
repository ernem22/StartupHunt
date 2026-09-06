"""Collect recently active questions from Stack Exchange's public API."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable

from collectors.http import create_session, get_json
from collectors.models import RawItem

API_URL = "https://api.stackexchange.com/2.3/questions"


def collect(sites: Iterable[str], limit: int = 50) -> list[RawItem]:
    site_list = tuple(sites)
    session = create_session()
    per_site = max(1, min(100, limit // max(1, len(site_list))))
    items: list[RawItem] = []

    for site in site_list:
        payload = get_json(
            session,
            API_URL,
            params={
                "site": site,
                "order": "desc",
                "sort": "activity",
                "pagesize": per_site,
                "filter": "withbody",
            },
        )
        if not isinstance(payload, dict):
            continue
        for question in payload.get("items", []):
            if not isinstance(question, dict):
                continue
            question_id = question.get("question_id")
            title = str(question.get("title") or "").strip()
            created = question.get("creation_date")
            if not question_id or not title or not isinstance(created, int):
                continue
            items.append(
                RawItem(
                    source="stackexchange",
                    external_id=f"{site}:{question_id}",
                    title=title,
                    text=str(question.get("body") or ""),
                    score=int(question.get("score") or 0),
                    num_comments=int(question.get("comment_count") or 0),
                    created_utc=datetime.fromtimestamp(created, tz=timezone.utc),
                    url=str(question.get("link") or ""),
                )
            )
    return items[:limit]
