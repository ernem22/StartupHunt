-- StartupHunt — PostgreSQL + pgvector şeması (plan.md v3.1 FAZ 3/7/11/14)
-- pgvector/pgvector imajı uzantıyı hazır içerir.

create extension if not exists vector;

-- FAZ 3: ham veri, immutable
create table if not exists raw_observations (
  id           bigserial primary key,
  source       text not null,
  source_id    text not null,
  raw_data     jsonb not null,
  collected_at timestamptz not null default now(),
  unique (source, source_id)
);

-- FAZ 4-7: normalize + clean + embed
create table if not exists observations (
  id             bigserial primary key,
  source         text not null,
  source_id      text not null,
  source_url     text not null unique,
  title          text,
  text           text not null,
  author         text,
  observed_at    timestamptz,
  collected_at   timestamptz not null default now(),
  language       text,
  metadata       jsonb not null default '{}',
  signal_types   text[] not null default '{}',
  content_hash   text,
  status         text not null default 'new',
  embedding      halfvec(1024),
  unique (source, source_id)
);
create index if not exists idx_observations_status       on observations (status);
create index if not exists idx_observations_content_hash on observations (content_hash);
create index if not exists idx_observations_language     on observations (language);
-- NOT: HNSW index bulk backfill BİTTİKTEN SONRA oluşturulur (insert pahalı):
--   create index on observations using hnsw (embedding halfvec_cosine_ops);

-- FAZ 9-11: pattern'lar
create table if not exists patterns (
  id                bigserial primary key,
  name              text,
  description       text,
  centroid          halfvec(1024),
  keywords          text[] not null default '{}',
  first_seen        timestamptz,
  last_seen         timestamptz,
  observation_count integer not null default 0,
  status            text not null default 'active', -- active | merged (recluster üstlenilmesi) | archived (insan junk kararı)
  review_status     text not null default 'unreviewed', -- unreviewed|seen|interesting|junk
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_patterns_centroid on patterns using hnsw (centroid halfvec_cosine_ops);

-- FAZ 13: atama geçmişi
create table if not exists pattern_observations (
  pattern_id     bigint not null references patterns(id) on delete cascade,
  observation_id bigint not null references observations(id) on delete cascade,
  similarity     real,
  assigned_at    timestamptz not null default now(),
  run_kind       text not null,
  primary key (pattern_id, observation_id)
);
create index if not exists idx_po_observation on pattern_observations (observation_id);

-- FAZ 13: recluster pattern ID sürekliliği (grill kararı 2026-09-21: overlaps eşleşme)
-- her recluster sonrası: ortak obs / eski obs oranı (>=0.50) eşleşenler kaydedilir;
-- eski pattern'ın review_status'ü yeniye taşınır; timeline observation'lardan hesaplanır.
create table if not exists pattern_history (
  old_pattern_id bigint not null,
  new_pattern_id bigint not null references patterns(id) on delete cascade,
  at             timestamptz not null default now(),
  overlap_ratio  real not null,
  primary key (old_pattern_id, at, new_pattern_id)
);

-- FAZ 11: entity metrikleri (trend/gelişme/gerilme)
create table if not exists metric_snapshots (
  id          bigserial primary key,
  entity_type text not null,
  entity_id   text not null,
  metric      text not null,
  value       double precision not null,
  captured_at timestamptz not null default now()
);
create index if not exists idx_metrics_entity on metric_snapshots (entity_type, entity_id, metric, captured_at);

-- FAZ 14: TR karşılık arama kaydı
create table if not exists counterpart_searches (
  id           bigserial primary key,
  pattern_id   bigint not null references patterns(id) on delete cascade,
  query        text not null,
  engine       text not null default 'searxng',
  ran_at       timestamptz not null default now(),
  result_count integer not null default 0,
  status      text not null default 'done'
);
create index if not exists idx_cs_pattern on counterpart_searches (pattern_id);

-- FAZ 13: adapter imleçleri — catch-up semantiği (cron değil resume)
-- last_cursor: adapter'e özel JSON (ör. reddit: {"SaaS":"2023-05-01T...", ...} — subreddit→imleç)
create table if not exists adapter_state (
  name            text primary key,
  last_run_at     timestamptz not null default now(),
  last_success_at timestamptz,
  last_cursor     jsonb,
  counters        jsonb not null default '{}'
);

-- View: pattern kaynakları (kolon değil — plan v3.1 kararı)
create or replace view v_pattern_sources as
select po.pattern_id,
       o.source,
       count(*) as observation_count
from pattern_observations po
join observations o on o.id = po.observation_id
group by po.pattern_id, o.source;

-- View: haftalık pattern frekansı (4 haftalık moving average dahil)
create or replace view v_pattern_frequency as
with weekly as (
  select po.pattern_id,
         date_trunc('week', o.observed_at) as week,
         count(*) as cnt
  from pattern_observations po
  join observations o on o.id = po.observation_id
  where o.observed_at is not null
  group by po.pattern_id, date_trunc('week', o.observed_at)
)
select pattern_id,
       week,
       cnt,
      avg(cnt) over (
        partition by pattern_id
        -- CodeRabbit fix: 'rows between' boş-haftaları düz sırada sayar (eksik hafta
        -- lost). RANGE takvim aralığı kullanmalı (4 haftalık pencere, zero-filled olmasa da
        -- time-sayısı bursun sönükted):
        order by week range between interval '28 days' preceding and current row
      ) as ma4
from weekly;
