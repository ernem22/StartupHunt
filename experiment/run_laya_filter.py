"""EXP-C: Laya choice keep/reject, snapshot uzerinde, idempotent resume."""
import hashlib
import json
import os
import sys
import time

import psycopg

DB_URL = os.environ["DATABASE_URL"]
MODEL = "laya-router(auto)"
RUN = os.environ.get("EXP_RUN", "laya-filter-v2")
BASE = os.environ.get("EXP_BASE", "baseline-v1")
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 2000

Q = {"verdict": {"type": "choice",
                 "instructions": "Is this a real user problem or a promotion?",
                 "criteria": {
                     "keep": "user problem, complaint, unmet need, explicit tool request",
                     "reject": "product promotion, launch announcement, bragging, joke, meta talk"}}}
QHASH = hashlib.sha256(json.dumps(Q, sort_keys=True).encode()).hexdigest()[:12]


def main():
    from laya import Router
    router = Router()
    with psycopg.connect(DB_URL, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """insert into experiment_runs (name,type,model,config,snapshot,status)
                   select %s,'laya-filter','laya-router(auto)',
                     jsonb_build_object('question','choice-keep-reject-v1',
                       'question_sha',%s::text,'laya_version',%s::text),
                     snapshot,'running' from experiment_runs where name=%s
                   on conflict (name) do update set status='running'
                   returning id, (snapshot->>'ids')::jsonb""",
                (RUN, QHASH, __import__("laya").__version__, BASE),
            )
            row = cur.fetchone()
            if row is None:
                print("once baseline snapshot gerekli!", flush=True)
                return
            run_id, snap_ids = row
            cur.execute(
                """select o.id, coalesce(o.title,''), o.text from observations o
                   where o.id = any(%s) and not exists
                     (select 1 from preprocessing_results p
                      where p.experiment_id=%s and p.observation_id=o.id)
                   order by o.id limit %s""",
                (snap_ids, run_id, LIMIT),
            )
            pending = cur.fetchall()
        conn.commit()
    print(f"run={run_id} islenecek: {len(pending)}", flush=True)
    n_keep = n_rej = n_err = 0
    with psycopg.connect(DB_URL, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            for k, (oid, title, text) in enumerate(pending, 1):
                state = (title + "\n\n" + text) if title else text
                t0 = time.time()
                try:
                    r = router.predict(state[:2000], Q)
                    a = r["answers"]["verdict"]
                    ch = a["choice"]
                    d = "keep" if ch == "keep" else "reject"
                    c = float(a.get("answer_confidence", 0.5))
                    routed = r.get("routing", {}).get("model")
                    rev = (router.loaded_revisions or {}).get(routed or "", "")
                    raw = {"choice": ch, "confidence": c, "routing": routed}
                except Exception as e:
                    d, c, raw, rev = "processing_error", 0.0, {"error": str(e)[:200]}, ""
                ms = (time.time() - t0) * 1000.0
                n_keep += d == "keep"
                n_rej += d == "reject"
                n_err += d == "processing_error"
                cur.execute(
                    """insert into preprocessing_results
                       (experiment_id,observation_id,model,decision,confidence,raw_result,
                        elapsed_ms,checkpoint_rev)
                       values (%s,%s,%s,%s,%s,%s::jsonb,%s,%s)
                       on conflict do nothing""",
                    (run_id, oid, MODEL, d, c, json.dumps(raw), ms, rev),
                )
                if k % 200 == 0:
                    conn.commit()
                    print(f"  {k}/{len(pending)} (keep={n_keep} rej={n_rej} err={n_err})", flush=True)
            conn.commit()
            cur.execute(
                """select count(*) filter (where decision='keep') from preprocessing_results
                   where experiment_id=%s""",
                (run_id,),
            )
            total_keep = cur.fetchone()[0]
    print(f"C BITTI: toplam keep={total_keep} (bu chunk keep={n_keep} rej={n_rej} err={n_err})", flush=True)


if __name__ == "__main__":
    main()
