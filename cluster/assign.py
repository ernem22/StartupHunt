# FAZ 13 — SIK güncelleme: centroid assignment worker (plan v3.2)
# Yeni embedded observation'ları UMAP/HDBSCAN ÇALIŞTIRMADAN mevcut pattern
# centroid'lerine cosine similarity ile atar; eşik altındaysa atama yok (sıradaki
# recluster'ı bekler). run_kind='centroid'.
#
# Çalıştırma: python -m cluster.assign
# Eşik: 0.55 — pilot veriyle kalibre edilecek (TR/EN çift testi sonrası).

import json
import os

import numpy as np
import psycopg
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://startuphunt:startuphunt@localhost:5432/startuphunt",
)
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
                  -- 'embedded_noise' işaretliler yeniden atanmaz (recluster'ın kararına saygı)
                  and o.status <> 'embedded_noise'
                  -- deep_dive_for GEÇİCİ obs cluster'a giremez (plan: geçici corpus)
                  and not (o.metadata ? 'deep_dive_for')
                  -- CodeRabbit: sadece AKTİF pattern link'i "atanmış" sayar —
                  -- yalnızca archived/merged linki olan obs yeniden atanabilir
                  and not exists (
                    select 1
                    from pattern_observations po
                    join patterns p on p.id = po.pattern_id
                    where po.observation_id = o.id
                      and p.status = 'active'
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
                        values (%s, %s, %s, 'centroid')
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
                          select count(*) from pattern_observations where pattern_id = %s
                       ),
                       last_seen = (
                         select max(o.observed_at) from pattern_observations po
                         join observations o on o.id = po.observation_id
                         where po.pattern_id = %s
                       )
                     where id = %s
                    """,
                    (pid, pid, pid),
                )
        conn.commit()

    print(f"✔ atama tamam: {assigned}/{len(obs_ids)} atandı (eşik {SIMILARITY_THRESHOLD})")


if __name__ == "__main__":
    main()
