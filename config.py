"""Runtime configuration for the collection phase."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

DB_URL = os.environ.get("DB_URL", "")
PH_TOKEN = os.environ.get("PH_TOKEN", "")
PH_CLIENT_ID = os.environ.get("PH_CLIENT_ID", "")
PH_CLIENT_SECRET = os.environ.get("PH_CLIENT_SECRET", "")
COLLECT_LIMIT = int(os.environ.get("COLLECT_LIMIT", "50"))
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_BATCH_SIZE = int(os.environ.get("EMBEDDING_BATCH_SIZE", "64"))
REDDIT_SUBREDDITS = tuple(
    value.strip()
    for value in os.environ.get(
        "REDDIT_SUBREDDITS", "startups,SaaS,Entrepreneur,smallbusiness",
    ).split(",")
    if value.strip()
)
STACKEXCHANGE_SITES = tuple(
    value.strip()
    for value in os.environ.get(
        "STACKEXCHANGE_SITES", "stackoverflow,softwareengineering,webapps",
    ).split(",")
    if value.strip()
)
