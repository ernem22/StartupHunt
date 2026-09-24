CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS raw_items (
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL DEFAULT '',
    score INTEGER,
    num_comments INTEGER,
    created_utc TIMESTAMPTZ NOT NULL,
    url TEXT,
    embedding vector(384),
    PRIMARY KEY (source, external_id)
);

CREATE INDEX IF NOT EXISTS raw_items_created_utc_idx
    ON raw_items (created_utc DESC);
