"""Small HTTP helper shared by public API collectors."""

from __future__ import annotations

import requests


def create_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "StartupHunt/0.1 (research pipeline; contact: local@startup-hunt)",
            "Accept": "application/json",
        }
    )
    return session


def get_json(session: requests.Session, url: str, **kwargs: object) -> object:
    response = session.get(url, timeout=20, **kwargs)
    response.raise_for_status()
    return response.json()
