"""Collect Product Hunt launches via its GraphQL API."""

from __future__ import annotations

from datetime import datetime

from collectors.http import create_session
from collectors.models import RawItem

API_URL = "https://api.producthunt.com/v2/api/graphql"
QUERY = """
query RecentPosts($first: Int!) {
  posts(first: $first, order: NEWEST) {
    edges {
      node { id name tagline votesCount commentsCount createdAt url }
    }
  }
}
"""


def collect(
    token: str,
    client_id: str = "",
    client_secret: str = "",
    limit: int = 50,
) -> list[RawItem]:
    if not token and not (client_id and client_secret):
        return []
    session = create_session()
    if not token:
        token = _get_client_token(session, client_id, client_secret)
    response = session.post(
        API_URL,
        json={"query": QUERY, "variables": {"first": min(limit, 50)}},
        headers={"Authorization": f"Bearer {token}"},
        timeout=20,
    )
    if response.status_code == 401:
        raise RuntimeError(
            "Product Hunt authentication failed (401). Check PH_TOKEN, or provide both "
            "PH_CLIENT_ID and PH_CLIENT_SECRET."
        )
    response.raise_for_status()
    payload = response.json()
    if payload.get("errors"):
        raise RuntimeError(f"Product Hunt API error: {payload['errors']}")

    edges = payload.get("data", {}).get("posts", {}).get("edges", [])
    items: list[RawItem] = []
    for edge in edges:
        node = edge.get("node", {}) if isinstance(edge, dict) else {}
        product_id = node.get("id")
        name = str(node.get("name") or "").strip()
        created = node.get("createdAt")
        if not product_id or not name or not created:
            continue
        items.append(
            RawItem(
                source="producthunt",
                external_id=str(product_id),
                title=name,
                text=str(node.get("tagline") or ""),
                score=int(node.get("votesCount") or 0),
                num_comments=int(node.get("commentsCount") or 0),
                created_utc=datetime.fromisoformat(str(created).replace("Z", "+00:00")),
                url=str(node.get("url") or ""),
            )
        )
    return items


def _get_client_token(session: object, client_id: str, client_secret: str) -> str:
    response = session.post(  # type: ignore[union-attr]
        "https://api.producthunt.com/v2/oauth/token",
        json={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials",
        },
        timeout=20,
    )
    response.raise_for_status()
    token = response.json().get("access_token")
    if not token:
        raise RuntimeError("Product Hunt token endpoint returned no access token")
    return str(token)
