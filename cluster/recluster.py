# FAZ 8/9/10 — BERTopic recluster worker (plan v3.1)
# embedded observation'ları DB'den çeker; UMAP+HDBSCAN+c-TF-IDF çalıştırır;
# sonuçları patterns + pattern_observations'a yazar (run_kind='recluster').
# SEYREK güncelleme modu — FAZ 13'ün 2. katmanı.
#
# Çalıştırma: python -m cluster.recluster
# Gereksinim: bertopic, pgvector uyumlu psycopg, scikit-learn

import json
import sys

import numpy as np
import psycopg
from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer
from umap import UMAP

DB_URL = "postgresql://startuphunt:startuphunt@localhost:5432/startuphunt"

# ——— parametreler (plan FAZ 8: hacme göre kalibre) ———
UMAP_N_NEIGHBORS = 15
UMAP_N_COMPONENTS = 10
HDBSCAN_MIN_CLUSTER_SIZE = 25
HDBSCAN_MIN_SAMPLES = 10
RANDOM_STATE = 42  # tekrarlanabilirlik — plan kararı
TOPIC_LIMIT = 300  # fazla topic'e karşı plan FAQ pratiği


def fetch_embeddings(cur):
    """embedded + embedding dolu observation'lar: (id, metin, vektör)."""
    cur.execute(
        """
        select id, coalesce(title, '') || E'\n\n' || text, embedding::text
        from observations
        where status = 'embedded' and embedding is not null
        order by id
        """
    )
    rows = cur.fetchall()
    if not rows:
        return [], [], []
    ids = [r[0] for r in rows]
    docs = [r[1] for r in rows]
    vecs = [json.loads(r[2]) for r in rows]  # halfvec::text → "[0.1,0.2,...]" → list
    return ids, docs, np.array(vecs, dtype=np.float32)


def main():
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            ids, docs, embeddings = fetch_embeddings(cur)

    n = len(ids)
    if n < HDBSCAN_MIN_CLUSTER_SIZE * 2:
        print(f"✖ yetersiz veri: {n} observation (en az ~{HDBSCAN_MIN_CLUSTER_SIZE*2} gerekir)")
        sys.exit(0)

    print(f"▶ {n} embedding — UMAP({UMAP_N_COMPONENTS}D) + HDBSCAN(min_cluster={HDBSCAN_MIN_CLUSTER_SIZE})")

    umap_model = UMAP(
        n_neighbors=UMAP_N_NEIGHBORS,
        n_components=UMAP_N_COMPONENTS,
        min_dist=0.0,
        metric="cosine",
        random_state=RANDOM_STATE,
    )
    hdbscan_model = HDBSCAN(
        min_cluster_size=HDBSCAN_MIN_CLUSTER_SIZE,
        min_samples=HDBSCAN_MIN_SAMPLES,
        metric="euclidean",
        cluster_selection_method="eom",
        prediction_data=True,
    )
    vectorizer = CountVectorizer(stop_words="english", ngram_range=(1, 2), min_df=5)
    representation = KeyBERTInspired()

    topic_model = BERTopic(
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer,
        representation_model=representation,
        calculate_probabilities=False,
        low_memory=True,
    )

    topics, _ = topic_model.fit_transform(docs, embeddings)

    info = topic_model.get_topic_info()
    n_clusters = len([t for t in info.Topic if t != -1])
    noise = int((np.array(topics) == -1).sum())
    print(f"  {n_clusters} cluster, {noise} noise ({noise*100//n}%)")

    # pattern adı: BERTopic temsili (KeyBERT keywords'tan üretilir)
    topic_names: dict[int, str] = {
        int(row.Topic): str(row.Name) for row in info.itertuples() if row.Topic != -1
    }
    # c-TF-IDF keywords — patterns.keywords (TR karşılık sorgusunun girdisi, FAZ 14)
    topic_keywords: dict[int, list[str]] = {
        int(t): [w for w, _ in topic_model.get_topic(t)[:15]]
        for t in info.Topic
        if t != -1
    }

    # ——— DB yazımı: patterns + pattern_observations ———
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            # eski recluster atamalarını arşivlemeden silme — plan: seyrek güncellemede
            # eski pattern'lar 'merged' olarak işaretlenir, yeni centroid bazlı eşleşme
            # FAZ 13'te ayrı ele alınır. Bu worker her çalıştırmada YENİ pattern seti yazar.
            cur.execute("update patterns set status = 'archived' where status = 'active'")

            topic_docs: dict[int, list[int]] = {}
            topic_members: dict[int, list[int]] = {}
            for obs_id, topic in zip(ids, topics):
                if topic == -1:
                    continue
                topic_docs.setdefault(topic, []).append(obs_id)

            # cluster üyesi indeksleri (vektör ortalaması için)
            for i, topic in enumerate(topics):
                if topic == -1:
                    continue
                topic_members.setdefault(topic, []).append(i)

            for topic, members in topic_members.items():
                centroid = embeddings[members].mean(axis=0)
                centroid = (centroid / np.linalg.norm(centroid)).tolist()  # normalize
                kw = topic_keywords.get(topic, [])
                obs_list = topic_docs[topic]

                cur.execute(
                    """
                    insert into patterns (name, centroid, keywords, observation_count, status)
                    values ($1, $2::halfvec, $3, $4, 'active')
                    returning id
                    """,
                    (
                        topic_names.get(topic, f"cluster-{topic}"),
                        json.dumps(centroid),
                        kw,
                        len(obs_list),
                    ),
                )
                pattern_id = cur.fetchone()[0]

                cur.executemany(
                    """
                    insert into pattern_observations (pattern_id, observation_id, run_kind)
                    values ($1, $2, 'recluster')
                    on conflict do nothing
                    """,
                    [(pattern_id, oid) for oid in obs_list],
                )

            # timeline alanları tek toplu sorguyla doldurulur (satır başına min/max yerine)
            cur.execute(
                """
                update patterns p
                   set first_seen = s.first_seen,
                       last_seen  = s.last_seen
                  from (
                    select po.pattern_id,
                           min(o.observed_at) as first_seen,
                           max(o.observed_at) as last_seen
                    from pattern_observations po
                    join observations o on o.id = po.observation_id
                    group by po.pattern_id
                  ) s
                 where p.id = s.pattern_id
                """
            )

        conn.commit()

    print(f"✔ recluster tamam: {n_clusters} pattern yazıldı (noise: {noise})")


if __name__ == "__main__":
    main()
