# FAZ 13 — SIK güncelleme: centroid assignment worker (plan v3.1)
# Yeni embedded observation'ları UMAP/HDBSCAN ÇALIŞTIRMADAN mevcut pattern
# centroid'lerine cosine similarity ile atar; eşik altındaysa atama yok (sıradaki
# recluster'ı bekler). run_kind='centroid'.
#
# Çalıştırma: python -m cluster.assign
# Eşik: 0.55 — pilot veriyle kalibre edilecek (TR/EN çift testi sonrası).

import json
import sys

import numpy as np
import psycopg

DB_URL = "postgresql://startuphunt:startuphunt@localhost:5432/startuphunt"
SIMILARITY_THRESHOLD = 0.55


def main():
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            # 1) aktif pattern'ler: (id, centroid)
            cur.execute(
                """
                select id, centroid::text, observation_count
                from patterns
                where status = 'active' and centroid is not null
                """
            )
            rows = cur.fetchall()
            if not rows:
                print("✖ aktif pattern yok — önce recluster çalıştır")
                sys.exit(0)
            pattern_ids = [r[0] for r in rows]
            centroids = np.array([json.loads(r[1]) for r in rows], dtype=np.float32)
            counts = {r[0]: r[2] for r in rows}

            # 2) atanmamış yeni embedding'ler
            cur.execute(
                """
                select o.id, o.embedding::text
                from observations o
                where o.status = 'embedded' and o.embedding is not null
                  and not exists (
                    select 1 from pattern_observations po where po.observation_id = o.id
                  )
                """
            )
            new_rows = cur.fetchall()

    if not new_rows:
        print("✔ atanacak yeni observation yok")
        return

    obs_ids = [r[0] for r in new_rows]
    obs_vecs = np.array([json.loads(r[1]) for r in new_rows], dtype=np.float32)
    print(f"▶ {len(obs_ids)} yeni observation, {len(pattern_ids)} aktif pattern")

    # cosine: hepsi normalize (embedding'ler TEI'den normalize gelmeyebilir — güvenli normalize)
    def norm(m):
        return m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-10)

    sims = norm(obs_vecs) @ norm(centroids).T  # (n_obs, n_pat)
    assigned = 0

    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            for i, obs_id in enumerate(obs_ids):
                j = int(np.argmax(sims[i]))
                if sims[i][j] >= SIMILARITY_THRESHOLD:
                    pid = pattern_ids[j]
                    cur.execute(
                        """
                        insert into pattern_observations (pattern_id, observation_id, similarity, run_kind)
                        values ($1, $2, $3, 'centroid')
                        on conflict do nothing
                        """,
                        (pid, obs_id, float(sims[i][j])),
                    )
                    counts[pid] = counts.get(pid, 0) + 1
                    assigned += 1

            # pattern sayaç/timeline güncelle
            for pid, cnt in counts.items():
                cur.execute(
                    """
                    update patterns
                       set observation_count = (
                             select count(*) from pattern_observations where pattern_id = $1
                           ),
                           last_seen = (
                             select max(o.observed_at) from pattern_observations po
                             join observations o on o.id = po.observation_id
                             where po.pattern_id = $1
                           )
                     where id = $1
                    """,
                    (pid,),
                )
        conn.commit()

    print(f"✔ atama tamam: {assigned}/{len(obs_ids)} atandı (eşik {SIMILARITY_THRESHOLD})")


if __name__ == "__main__":
    main()
