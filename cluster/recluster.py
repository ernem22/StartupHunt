# FAZ 8/9/10 — BERTopic recluster worker (plan v3.2 FAZ 13/10)
# embedded observation'ları DB'den çeker; UMAP+HDBSCAN+c-TF-IDF çalıştırır;
# sonuçları patterns + pattern_observations'a yazar (run_kind='recluster').
#
# Pattern ID sürekliliği (v3.2 karar):
#   - eski aktif pattern'lar 'merged' olur ('archived' DEĞİL — o yalnızca insan junk kararıdır)
#   - overlap = ortak obs / eski obs; %50 üstü eşleşmeler pattern_history'ye yazılır
#   - eski review_status YALNIZCA en yüksek oranlı TEK yeni pattern'a taşınır (split
#     çift-onayı önler); hedef halihazırda işaretleyse (merge çakışması) yalnız ilk
#     (sabit iterasyon sırası) taşınır, deterministiktir
#
# Çalıştırma: python -m cluster.recluster
# Gereksinim: bertopic, psycopg, scikit-learn

import json
import os
import sys

import numpy as np
import psycopg
from dotenv import load_dotenv
from bertopic import BERTopic
from hdbscan import HDBSCAN
from sklearn.feature_extraction.text import CountVectorizer
from umap import UMAP

load_dotenv()
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://startuphunt:startuphunt@localhost:5432/startuphunt",
)

# —— parametreler (plan FAZ 8: hacme göre kalibre) ——
UMAP_N_NEIGHBORS = 15
UMAP_N_COMPONENTS = 10
HDBSCAN_MIN_CLUSTER_SIZE = 25
HDBSCAN_MIN_SAMPLES = 10
RANDOM_STATE = 42  # tekrarlanabilirlik — plan kararı
OVERLAP_MIN = 0.50  # pattern_history eşleşme eşiği (plan FAZ 13 kararı)
TRANSFER_MIN = 0.50  # review_status taşınma aynı eşikle


def fetch_embeddings(cur):
    """embedded + embedded_noise + embedding dolu observation'lar: (id, metin, vektör).
    - embedded_noise: önceki recluster'ın noise'ları — SONRAKİ recluster onları yeniden
      değerlendirmeli (kaçırma yok ilkesi); yeniden noise kalırsa işaret yenilenir.
    - deep_dive_for işaretli GEÇİCİ obs'ler cluster'a girmez (plan: geçici corpus)."""
    cur.execute(
        """
        select id, coalesce(title, '') || E'\n\n' || text, embedding::text
        from observations
        where (status = 'embedded' or status = 'embedded_noise')
          and embedding is not null
          and not (metadata ? 'deep_dive_for')
        order by id
        """
    )
    rows = cur.fetchall()
    if not rows:
        return [], [], []
    ids = [r[0] for r in rows]
    docs = [r[1] for r in rows]
    vecs = [json.loads(r[2]) for r in rows]  # halfvec::text → "[0.1,0.2,...]"
    return ids, docs, np.array(vecs, dtype=np.float32)


def main():
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            ids, docs, embeddings = fetch_embeddings(cur)

    n = len(ids)
    if n < HDBSCAN_MIN_CLUSTER_SIZE * 2:
        print(f"✖ yetersiz veri: {n} observation (en az ~{HDBSCAN_MIN_CLUSTER_SIZE*2} gerekir)")
        sys.exit(0)

    # —— eski aktif pattern'ların kaydı (overlap için, yazımdan ÖNCE) ——
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                select p.id, p.review_status, p.status,
                       coalesce((select array_agg(po.observation_id) from pattern_observations
                                  po where po.pattern_id = p.id), '{}')
                from patterns p where p.status = 'active'
                """
            )
            old_patterns = [
                {"id": r[0], "review": r[1], "status": r[2], "obs": set(r[3])}
                for r in cur.fetchall()
            ]
            print(f"eski aktif pattern: {len(old_patterns)}")

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
    # c-TF-IDF bütün corpus'u tek belge kabul eder → min_df 'topic başına' anlamdır;
    # topic sayısı fit ÖNCESİ bilinemez (CodeRabbit doğru: n_clusters burada yok) →
    # min_df=1 sabit; noise kelime filtresi pilot fazında CountVectorizer'a stopword
    # listesi ile büyütülür (plan FAZ 8 kalibrasyonu).
    vectorizer = CountVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1)

    topic_model = BERTopic(
        umap_model=umap_model,
        hdbscan_model=hdbscan_model,
        vectorizer_model=vectorizer,
        # representation_model YOK — keywords saf c-TF-IDF'ten gelir (plan FAZ 9:
        # "keywords: cluster'ın en ayırt edici terimleri (c-TF-IDF)"; KeyBERTInspired ayrıca
        # kendi embedding dosyasını indirir ve determinizmi azaltır — CodeRabbit/doğrulanmış)
        calculate_probabilities=False,
        low_memory=True,
    )

    topics, _ = topic_model.fit_transform(docs, embeddings)

    info = topic_model.get_topic_info()
    n_clusters = len([t for t in info.Topic if t != -1])
    noise = int((np.array(topics) == -1).sum())
    print(f"  {n_clusters} cluster, {noise} noise ({noise*100//n}%)")

    topic_names: dict[int, str] = {
        int(row.Topic): str(row.Name) for row in info.itertuples() if row.Topic != -1
    }
    topic_keywords: dict[int, list[str]] = {
        int(t): [w for w, _ in topic_model.get_topic(t)[:15]]
        for t in info.Topic
        if t != -1
    }

    # —— DB yazımı ——
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            topic_docs: dict[int, list[int]] = {}
            noise_ids: list[int] = []
            for obs_id, topic in zip(ids, topics):
                if topic == -1:
                    noise_ids.append(obs_id)  # noise → 'embedded_noise' işareti (orchestrator tetiği bunları dışlar)
                    continue
                topic_docs.setdefault(topic, []).append(obs_id)

            if noise_ids:
                cur.executemany(
                    "update observations set status = 'embedded_noise' where id = %s",
                    [(i,) for i in noise_ids],
                )

            topic_members: dict[int, list[int]] = {}
            for i, topic in enumerate(topics):
                if topic == -1:
                    continue
                topic_members.setdefault(topic, []).append(i)

            new_patterns = []  # (new_id, obs_set)
            for topic, members in topic_members.items():
                centroid = embeddings[members].mean(axis=0)
                centroid = (centroid / np.linalg.norm(centroid)).tolist()
                kw = topic_keywords.get(topic, [])
                obs_list = topic_docs[topic]

                cur.execute(
                    """
                    insert into patterns (name, centroid, keywords, observation_count, status)
                    values (%s, %s::halfvec, %s, %s, 'active')
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
                    values (%s, %s, 'recluster')
                    on conflict do nothing
                    """,
                    [(pattern_id, oid) for oid in obs_list],
                )
                new_patterns.append((pattern_id, set(obs_list)))

            # —— pattern_history + review_status taşınması (deterministik: sabit old-id sırası;
            # her eski pattern en-çok ortak yeni'yi seçer; transfer hedef zaten işaretliyse yok sayılır) ——
            history_rows: list[tuple[int, int | None, float, bool]] = []
            for op in sorted(old_patterns, key=lambda o: o["id"]):
                if not op["obs"]:
                    continue
                best_id, best_ratio = None, 0.0
                for new_id, nobs in new_patterns:
                    inter = len(op["obs"] & nobs)
                    ratio = inter / len(op["obs"])
                    if ratio > best_ratio:
                        best_id, best_ratio = new_id, ratio

                matched = best_id is not None and best_ratio >= OVERLAP_MIN
                history_rows.append((op["id"], best_id, best_ratio, matched))

            transferred: list[int] = []
            for old_id, new_id, ratio, matched in history_rows:
                if new_id is None:
                    continue
                cur.execute(
                    """
                    insert into pattern_history (old_pattern_id, new_pattern_id, overlap_ratio)
                    values (%s, %s, %s)
                    on conflict do nothing
                    """,
                    (old_id, new_id, ratio),
                )
                if matched:
                    cur.execute(
                        """
                        update patterns
                           set review_status = (select p2.review_status from patterns p2 where p2.id = %s),
                               status = 'active'
                         where id = %s and review_status = 'unreviewed'
                        """,
                        (old_id, new_id),
                    )
                    if cur.rowcount > 0:
                        transferred.append(old_id)

            # eski aktif pattern'lar 'merged' — 'archived' yalnızca insan junk'tır
            cur.execute(
                "update patterns set status = 'merged' where status = 'active' and id = any(%s)",
                ([op["id"] for op in old_patterns],),
            )

            # timeline alanları tek toplu sorguyla
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

    print(
        f"✔ recluster tamam: {n_clusters} pattern yazıldı (noise: {noise}); "
        f"history={len(history_rows)}, review_transfer={len(transferred)}"
    )


if __name__ == "__main__":
    main()
