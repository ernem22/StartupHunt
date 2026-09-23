# StartupHunt — Kurulum (RTX 3060 cihazı)

Geliştirme bu makinede; çalıştırma NVIDIA cihazında (plan.md → "ALTYAPI VE DONANIM").

## Gereksinimler (çalıştırma cihazı)

- Docker Desktop **+ WSL2 backend + GPU desteği** (Settings → General → "Use the WSL 2 based engine"; Resources → WSL Integration)
  - Windows: NVIDIA sürücüsü yeterli (CUDA toolkit gerekmez)
  - WSL içinde: `nvidia-smi` çalışıyor olmalı
- ~20GB boş disk (TEI model cache + Postgres)

## Başlat

```bash
cp .env.example .env          # şifreleri değiştir
docker compose up -d         # postgres + tei + searxng
docker compose ps            # hepsi healthy/running olmalı
```

İlk `up` TEI modelini (~1.2GB) indirir — birkaç dakika sürebilir.

## Doğrulama

```bash
# 1) pgvector şeması kuruldu mu (8 tablo + 2 view görmelisin)
#    raw_observations, observations, patterns, pattern_observations, pattern_history,
#    metric_snapshots, counterpart_searches, adapter_state
docker exec startuphunt-postgres psql -U startuphunt -d startuphunt -c "\dt"

# 2) TEI + GPU çalışıyor mu (1024 boyutlu vektör dönmeli)
curl -s http://localhost:8080/embed \
  -H "Content-Type: application/json" \
  -d '{"inputs": ["merhaba dünya", "hello world"]}' | python -m json.tool

# 3) SearXNG JSON API açık mı (results dizisi dönmeli)
curl -s "http://localhost:8888/search?q=fiyat+artışı&language=tr&format=json" | python -m json.tool | head -40
```

## Portlar

| Servis | Port |
| --- | --- |
| PostgreSQL | 5432 |
| TEI (embed) | 8080 |
| SearXNG | 8888 |

## Uçtan uca ilk akış (adapter'lar + pipeline + cluster)

```bash
# 1) Toplama (Node.js tarafı — repo kökünde)
pnpm install
cp .env.example .env          # anahtarları doldur (GITHUB_TOKEN, ...)
pnpm collect reddit-backfill -- --limit 50000   # ilk backfill (idempotent — tekrar çalıştırılabilir)

# 2) Temizlik + embedding (TEI GPU'da)
pnpm pipeline clean
pnpm pipeline embed

# 3) Clustering (Python tarafı — repo kökünden koş; cd cluster YAPMA)
pip install -r cluster/requirements.txt
python -m cluster.recluster   # seyrek: UMAP+HDBSCAN → patterns'e yazar
# sonrası her yeni veride:
python -m cluster.assign      # sık: centroid assignment (ucuz)
# recluster: takvim yok — TETİK bazlı (atanmamış embedded obs oranı eşiği aşılırsa koş;
# `pnpm orchestrate` günlük koşum bunu kendisi yönetir)
```

Not: Python worker'lar DB bağlantısını `DATABASE_URL` env'inden okur (`.env` yüklenmez —
`orchestrate` (.env ile) kullan ya da elle koşumda önce `export DATABASE_URL=...` (Windows'ta
`$env:DATABASE_URL="postgresql://..."`). Kaynak dosyada DB URL DÜZENLEME — CodeRabbit: tracked dosyaya kimlik yazılmaz.

## Dur / sıfırla

```bash
docker compose down          # veriler kalır (volume)
docker compose down -v       # DİKKAT: Postgres + model cache silinir
```
