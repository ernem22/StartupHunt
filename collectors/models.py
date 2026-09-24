"""The shared schema emitted by all collectors."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class RawItem:
    source: str
    external_id: str
    title: str
    text: str
    score: int | None
    num_comments: int | None
    created_utc: datetime
    url: str | None
