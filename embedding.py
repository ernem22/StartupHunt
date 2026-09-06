"""Create pgvector embeddings for raw items that do not have one yet."""

from __future__ import annotations

import json
import logging
from collections.abc import Iterator

import psycopg
from sentence_transformers import SentenceTransformer

from config import DB_URL, EMBEDDING_BATCH_SIZE, EMBEDDING_MODEL

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

ENSURE_EMBEDDING_COLUMN = """
ALTER TABLE raw_items
ADD COLUMN IF NOT EXISTS embedding vector(384);
"""

SELECT_UNEMBEDDED = """
SELECT source, external_id, title, text
FROM raw_items
WHERE embedding IS NULL
ORDER BY created_utc ASC
LIMIT %(limit)s;
"""

UPDATE_EMBEDDING = """
UPDATE raw_items
SET embedding = %(embedding)s::vector
WHERE source = %(source)s AND external_id = %(external_id)s;
"""


def document_text(title: str, text: str) -> str:
    """Provide the signal-bearing text while keeping model input reasonably bounded."""
    return f"{title}\n\n{text}"[:8_000]


def batches(connection: psycopg.Connection[object], size: int) -> Iterator[list[dict[str, str]]]:
    while True:
        with connection.cursor(row_factory=psycopg.rows.dict_row) as cursor:
            cursor.execute(SELECT_UNEMBEDDED, {"limit": size})
            rows = cursor.fetchall()
        if not rows:
            return
        yield rows


def main() -> None:
    if not DB_URL:
        raise RuntimeError("DB_URL is required. Run through Docker Compose or set it in .env.")
    if EMBEDDING_BATCH_SIZE < 1:
        raise ValueError("EMBEDDING_BATCH_SIZE must be at least 1")

    logger.info("Loading embedding model: %s", EMBEDDING_MODEL)
    model = SentenceTransformer(EMBEDDING_MODEL)
    if model.get_sentence_embedding_dimension() != 384:
        raise RuntimeError(
            f"{EMBEDDING_MODEL} does not produce 384-dimensional vectors; "
            "update the database column before using it."
        )

    processed = 0
    with psycopg.connect(DB_URL) as connection:
        with connection.cursor() as cursor:
            cursor.execute(ENSURE_EMBEDDING_COLUMN)

        for rows in batches(connection, EMBEDDING_BATCH_SIZE):
            vectors = model.encode(
                [document_text(row["title"], row["text"]) for row in rows],
                batch_size=EMBEDDING_BATCH_SIZE,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
            updates = [
                {
                    "source": row["source"],
                    "external_id": row["external_id"],
                    "embedding": json.dumps(vector.tolist()),
                }
                for row, vector in zip(rows, vectors, strict=True)
            ]
            with connection.cursor() as cursor:
                cursor.executemany(UPDATE_EMBEDDING, updates)
            processed += len(updates)
            logger.info("Embedded %s items", processed)

    logger.info("Embedding complete: %s newly embedded items", processed)


if __name__ == "__main__":
    main()
