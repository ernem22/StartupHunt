# AGENTS.md — StartupHunt geliştirme referansı

## Ortam (kritik)
- Bu cihaz: HUAWEI laptop (Ryzen 5, 8GB, **GPU yok; Docker CLI var olabilir ama daemon yok**) — runtime doğrulama YAPILAMAZ (DB/embed/cluster testleri 3060 PC'de).
- Bu cihazda yapılabilecek: kod yazımı, `pnpm typecheck`, dry-run eden adapter'lar (BD'siz mod), offline işler.
- Docker gerektiren her şey (postgres/pgvector, TEI, SearXNG, BERTopic) 3060 PC'de koşar — orada test edilmedikçe "çalışıyor" SAYILMAZ; kod + LOG'a "3060'a bekleme" işareti.
- CI: `.github/workflows/ci.yml` — her PR'da typecheck + pgvector service üzerinde DB testi.
- Türkçe içerikli dosyalara PowerShell string manipülasyonu YASAK (mojibake) — sadece edit aracı.
- Scratch dosyaları workspace içinde tutulur ve bitince silinir; `%TEMP%` kullanılmaz.

## İş akışı (zorunlu)
- Her geliştirme kalemi = yeni branch + PR: `feat/<konu>`, `fix/<konu>`. Bug fixler de kendi branch'inden.
- İlk commit'ten önce `feat/<konu>`/`fix/<konu>` branch'i açılır; repo branch kuralı generic harness talimatından önce gelir.
- Tikete başlamadan `git status` temiz olmalı; ilgisiz değişiklikler ayrı `chore/<konu>` PR'ında toplanır.
- base = `main`; PR body'sinde ne yapıldı + doğrulanamayan kısımlar listelenir.
- Her anlamlı adım `LOG.md`'ye (tarih, ne, sonuç, sonraki adım) yazılır — merge öncesi dahil edilir.
- Plan değişimi gerektiren karar çıkarsa önce plan.md güncellenir sonra kod.
- `pnpm typecheck` her PR'da temiz olmalı; review'da mekanik kontroller CI'ya, judgement-call için `CODING_STANDARDS.md`'ye bakılır.
- Commit: sadece kendi işini; secrets (token/key) asla.

## Komutlar
- Güncel script listesi: `package.json` (`pnpm <script>`); burada kopyası tutulmaz.
- İstisnalar: `pnpm collect [adapter] -- --dry-run` (DB yazmaz), `pnpm deepen -- --pattern <id> --months N` / `pnpm deepen prune`, `pnpm counterpart -- --pattern <id>` (TR araması, yalnız review_status='interesting'), `pnpm orchestrate` (günlük insansız koşum).

## Mimari özet (ayrıntı: plan.md v3.2 — sözleşme değil hipotez)
- Kapsam/kararlar: `plan.md` §Kapsam Dışı + §Fırsat Katmanı v1.
- Akış: arşiv/resmî API → raw_observations(JSONB, immutable) → observations(normalize+clean+embed) → centroid assignment(günlük) → BERTopic recluster(TETİK: atanmamış oran eşiği; overlap eşleşme → pattern_history, review_status taşınır) → review server(insan) → TR araması(YALNIZCA onaylı) → UI(ertelendi).
- İlkeler: sistem kanıt sunar; filtre/skor/ağırlık YOK; LLM yalnız yorum katmanı; veri yolu %100 deterministik; scraper/proxy yok (arşiv=ArcticShift/GHArchive/SEDump; live=ArcticShift-incremental+HN/SE/YT API; Reddit OAuth donduruldu); gap yok sadece gecikme (imleç catch-up); junk=archived (silme yok), recluster üstlenmesi=merged.
- Durum eşlemesi: patterns.status: active|merged(recluster)|archived(insan junk); review_status: unreviewed|seen|interesting(="BU", TR tetiği)|junk.
- One-off: reddit-incremental(scraper tabanlı) OPT_IN — collect all'da YOK; RedditLiveAdapter(resmî OAuth) slotu devralacak.
- Temsili seçim kuralı (sabit): centroid'e en yakın 5 + en yeni 3.
- Terminoloji: observation=tek metin kaydı; pattern=cluster'ın kalıcı kimliği; "BU"=insan onayı.
- Açık ölçümler (pilot sonrası kapanır): recluster eşiği, assign eşik(0.55), outlier oranı, TR/EN split(FAZ14 öncesi 50 çift tests; geçilmeden TR adapter yazılmaz).

## Dosya haritası
- `plan.md` v3.2 (tek karar kaynağı) · `LOG.md` (geliştirme günlüğü) · `db/schema.sql` · `docker-compose.yml` · `cluster/{recluster,assign}.py` · `src/adapters/*` (collect kontratı: types.ts) · `src/pipeline/{clean,embed}.ts` · `src/config.ts` (SUBREDDITS 10, BACKFILL_SINCE=18 ay)

## Agent skills

### Issue tracker

Issue'lar GitHub Issues'ta tutulur (`ernem22/StartupHunt`, `gh` CLI). Ayrıntı: `docs/agents/issue-tracker.md`.

### Triage labels

Varsayılan beş triage etiketi kullanılır: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ayrıntı: `docs/agents/triage-labels.md`.

### Domain docs

Single-context: kökte `CONTEXT.md`, kararlar `docs/adr/` altında. Ayrıntı: `docs/agents/domain.md`.
