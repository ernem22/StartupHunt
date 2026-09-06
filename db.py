"""Database access for normalized raw items."""

from __future__ import annotations

from collections.abc import Iterable

import psycopg

from collectors.models import RawItem

UPSERT_RAW_ITEMS = """
INSERT INTO raw_items (
    source, external_id, title, text, score, num_comments, created_utc, url
) VALUES (
    %(source)s, %(external_id)s, %(title)s, %(text)s, %(score)s,
    %(num_comments)s, %(created_utc)s, %(url)s
)
ON CONFLICT (source, external_id) DO UPDATE SET
    title = EXCLUDED.title,
    text = EXCLUDED.text,
    score = EXCLUDED.score,
    num_comments = EXCLUDED.num_comments,
    created_utc = EXCLUDED.created_utc,
    url = EXCLUDED.url;
"""


def upsert_raw_items(database_url: str, items: Iterable[RawItem]) -> int:
    rows = [item.__dict__ for item in items]
    if not rows:
        return 0
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.executemany(UPSERT_RAW_ITEMS, rows)
    return len(rows)
