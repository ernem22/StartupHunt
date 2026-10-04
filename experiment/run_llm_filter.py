"""EXP-B: Qwen2.5-3B keep/reject, snapshot uzerinde, idempotent resume.
Kullanim: python exp_b.py [limit]  (varsayilan 500; kararsizlar islenir)"""
import json
import os
import re
import sys
import time

import psycopg
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

DB_URL = os.environ["DATABASE_URL"]
MODEL = "Qwen/Qwen2.5-3B-Instruct"
RUN = os.environ.get("EXP_RUN", "llm-filter-v1")
BASE = os.environ.get("EXP_BASE", "baseline-v1")
LIMIT = int(sys.argv[1]) if len(sys.argv) > 1 else 500

SYS = (
    "You filter observations for a startup-signal radar. "
    "Reply with ONLY a JSON object, no other text. "
    'Schema: {"keep": boolean, "confidence": number between 0 and 1}. '
    "Set keep=true when the text describes a user problem, complaint, unmet need, "
    "or explicit request for a tool — even if casually worded. "
    "Set keep=false for product promotions, launch announcements, bragging, jokes, "
    "and meta discussion. "
    'Example keep=true: {"keep": true, "confidence": 0.9} for '
    "\"I waste an hour a day copying invoices by hand, is there a tool for this?\". "
    'Example keep=false: {"keep": false, "confidence": 0.9} for '
    "\"Just launched my AI todo app, try it free!\"."
)


def decide(mdl, tok, title, text):
    msgs = [{"role": "system", "content": SYS},
            {"role": "user", "content": "Observation:\n" + (title + "\n\n" + text if title else text)}]
    prompt = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
    ids = tok(prompt, return_tensors="pt").to("cuda")
    with torch.no_grad():
        out = mdl.generate(**ids, max_new_tokens=60, do_sample=False,
                           pad_token_id=tok.eos_token_id)
    raw = tok.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True)
    m = re.search(r"\{.*\}", raw, re.S)
    try:
        got = json.loads(m.group(0)) if m else None
        assert isinstance(got.get("keep"), bool)
        conf = float(got.get("confidence", 0.5))
        return ("keep" if got["keep"] else "reject",
                max(0.0, min(1.0, conf)), {"raw": raw[:500]})
    except Exception:
        return ("processing_error", 0.0, {"raw": raw[:500]})


def main():
    with psycopg.connect(DB_URL, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            cur.execute(
                   """insert into experiment_runs (name,type,model,config,snapshot,status)
                   select %s,'llm-filter','Qwen2.5-3B-Instruct',
                     '{"temp":0,"prompt":"v2","max_new_tokens":60}'::jsonb,
                     snapshot,'running' from experiment_runs where name=%s
                   on conflict (name) do update set status='running'
                   returning id, (snapshot->>'ids')::jsonb""",
                   (RUN, BASE),
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
    print(f"run={run_id} kalan islenecek: {len(pending)}", flush=True)
    if not pending:
        with psycopg.connect(DB_URL, connect_timeout=20) as conn:
            with conn.cursor() as cur:
                cur.execute("update experiment_runs set status='done' where id=%s", (run_id,))
            conn.commit()
        print("B TAMAM", flush=True)
        return

    tok = AutoTokenizer.from_pretrained(MODEL)
    mdl = AutoModelForCausalLM.from_pretrained(
        MODEL, torch_dtype=torch.float16, device_map="cuda")
    mdl.eval()
    n_keep = n_rej = n_err = 0
    with psycopg.connect(DB_URL, connect_timeout=20) as conn:
        with conn.cursor() as cur:
            for k, (oid, title, text) in enumerate(pending, 1):
                d, c, raw = decide(mdl, tok, title, text)
                n_keep += d == "keep"
                n_rej += d == "reject"
                n_err += d == "processing_error"
                cur.execute(
                    """insert into preprocessing_results
                       (experiment_id,observation_id,model,decision,confidence,raw_result)
                       values (%s,%s,%s,%s,%s,%s::jsonb)
                       on conflict do nothing""",
                    (run_id, oid, MODEL, d, c, json.dumps(raw)),
                )
                if k % 50 == 0:
                    conn.commit()
                    print(f"  {k}/{len(pending)} (keep={n_keep} rej={n_rej} err={n_err})", flush=True)
            conn.commit()
    print(f"chunk bitti: keep={n_keep} reject={n_rej} err={n_err}", flush=True)


if __name__ == "__main__":
    main()
