"""EXP-A: baseline — dondurulmus snapshot'in mevcut vektorleriyle UMAP+HDBSCAN,
sonuclar yalnizca experiment_* tablolarina. Uretime yazmaz."""
import json
import os
import time

import numpy as np
import psycopg

DB_URL = os.environ["DATABASE_URL"]
SNAP_N = 2000
SEED = 123


def db():
    last = None
    for i in range(6):
        try:
            return psycopg.connect(DB_URL, connect_timeout=15)
        except Exception as e:
            last = e
            time.sleep(5)
    raise last


def main():
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "select id from observations where source in ('reddit','hackernews') "
                "and status in ('embedded','embedded_noise') and embedding is not null "
                "order by id"
            )
            pool = [r[0] for r in cur.fetchall()]
    print(f"havuz: {len(pool)}", flush=True)
    rng = np.random.default_rng(SEED)
    snap = sorted(rng.choice(pool, size=min(SNAP_N, len(pool)), replace=False).tolist())
    print(f"snapshot: {len(snap)} (seed {SEED})", flush=True)

    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """insert into experiment_runs (name, type, model, config, snapshot, status)
                   values ('baseline-v1','baseline',NULL,
                           '{"umap":{"n_neighbors":15,"n_components":10,"min_dist":0.0,"metric":"cosine","random_state":42},"hdbscan":{"min_cluster_size":25,"min_samples":10,"metric":"euclidean","cluster_selection_method":"eom"}}'::jsonb,
                           %s::jsonb, 'running')
                   on conflict (name) do update set status='running', snapshot=excluded.snapshot
                   returning id""",
                (json.dumps({"ids": snap, "seed": SEED,
                             "frozen_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}),),
            )
            run_id = cur.fetchone()[0]
            cur.execute("delete from experiment_pattern_observations where experiment_id=%s", (run_id,))
            cur.execute("delete from experiment_patterns where experiment_id=%s", (run_id,))
        conn.commit()
    print(f"run_id={run_id}", flush=True)

    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """select o.id, coalesce(o.title,'') || E'\n\n' || o.text, o.embedding::text,
                          o.observed_at
                   from observations o where o.id = any(%s) order by o.id""",
                (snap,),
            )
            rows = cur.fetchall()
    ids = [r[0] for r in rows]
    docs = [r[1] for r in rows]
    X = np.array([json.loads(r[2]) for r in rows], dtype=np.float32)
    obs_at = [r[3] for r in rows]
    print(f"vektor: {X.shape}", flush=True)

    from hdbscan import HDBSCAN
    from sklearn.feature_extraction.text import CountVectorizer
    from umap import UMAP

    t0 = time.time()
    Z = UMAP(n_neighbors=15, n_components=10, min_dist=0.0,
             metric="cosine", random_state=42).fit_transform(X)
    labels = HDBSCAN(min_cluster_size=25, min_samples=10, metric="euclidean",
                     cluster_selection_method="eom").fit_predict(Z)
    print(f"kümeleme: {time.time() - t0:.0f}sn", flush=True)
    uniq, counts = np.unique(labels, return_counts=True)
    n_cl = int((uniq != -1).sum())
    n_noise = int((labels == -1).sum())
    print(f"cluster={n_cl} noise={n_noise} ({n_noise * 100 / len(X):.0f}%)", flush=True)

    vec = CountVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1, max_features=20000)
    with db() as conn:
        with conn.cursor() as cur:
            new_ids = {}  # topic -> exp pattern id
            for u in uniq:
                if u == -1:
                    continue
                members = [i for i, l in enumerate(labels) if l == u]
                mat = vec.fit_transform([docs[i] for i in members])
                freq = np.asarray(mat.sum(axis=0)).ravel()
                names = vec.get_feature_names_out()
                top = [names[j] for j in freq.argsort()[-15:][::-1]]
                cent = X[members].mean(axis=0)
                cent = (cent / (np.linalg.norm(cent) + 1e-10)).tolist()
                obs_list = [ids[i] for i in members]
                ats = sorted(a for k, a in zip(members, [obs_at[i] for i in members]) if a)
                cur.execute(
                    """insert into experiment_patterns
                       (experiment_id, name, centroid, keywords, observation_count,
                        first_seen, last_seen)
                       values (%s,%s,%s::halfvec,%s,%s,%s,%s) returning id""",
                    (run_id, f"cluster-{u}", json.dumps(cent), top, len(obs_list),
                     ats[0] if ats else None, ats[-1] if ats else None),
                )
                pid = cur.fetchone()[0]
                new_ids[u] = pid
                cur.executemany(
                    """insert into experiment_pattern_observations
                       (experiment_id, pattern_id, observation_id, run_kind)
                       values (%s,%s,%s,'recluster') on conflict do nothing""",
                    [(run_id, pid, oid) for oid in obs_list],
                )
            cur.execute("update experiment_runs set status='done' where id=%s", (run_id,))
        conn.commit()
    print(f"YAZILDI: {n_cl} pattern (run {run_id})", flush=True)


if __name__ == "__main__":
    main()
