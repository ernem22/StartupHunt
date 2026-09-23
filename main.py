"""Collect public startup signals and store them in PostgreSQL."""

from __future__ import annotations

import logging
from collections.abc import Callable

from collectors import hackernews, producthunt, reddit, stackexchange
from collectors.models import RawItem
from config import (
    COLLECT_LIMIT,
    DB_URL,
    PH_CLIENT_ID,
    PH_CLIENT_SECRET,
    PH_TOKEN,
    REDDIT_SUBREDDITS,
    STACKEXCHANGE_SITES,
)
from db import upsert_raw_items

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    if not DB_URL:
        raise RuntimeError("DB_URL is required. Run through Docker Compose or set it in .env.")

    jobs: list[tuple[str, Callable[[], list[RawItem]]]] = [
        ("hackernews", lambda: hackernews.collect(COLLECT_LIMIT)),
        ("reddit", lambda: reddit.collect(REDDIT_SUBREDDITS, COLLECT_LIMIT)),
        ("stackexchange", lambda: stackexchange.collect(STACKEXCHANGE_SITES, COLLECT_LIMIT)),
        (
            "producthunt",
            lambda: producthunt.collect(
                PH_TOKEN, PH_CLIENT_ID, PH_CLIENT_SECRET, COLLECT_LIMIT
            ),
        ),
    ]
    total = 0
    for source, collect in jobs:
        if source == "producthunt" and not (PH_TOKEN or (PH_CLIENT_ID and PH_CLIENT_SECRET)):
            logger.warning("producthunt skipped: no Product Hunt credentials are configured")
            continue
        try:
            items = collect()
            stored = upsert_raw_items(DB_URL, items)
            total += stored
            logger.info("%s: stored %s items", source, stored)
        except Exception:
            logger.exception("%s collection failed; continuing with remaining sources", source)
    logger.info("Collection finished: %s items processed", total)


if __name__ == "__main__":
    main()
