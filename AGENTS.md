# AGENTS.md — StartupHunt

## Başlangıç

İş sırası: üzerinde çalışılan ticket → o özelliğin spec'i (issue gövdesinde) → `docs/adr/` → `GLOSSARY.md`. Tracker, triage ve repo iş akışı: `docs/agents/`. Kontroller: `pnpm check`.

## Ortam

- Windows (win32), PowerShell 5.1. Runtime sürümleri sabit: `.nvmrc` (Node), `engines` (pnpm). Python, Docker ve veritabanı yok; `pnpm radar` ve `pnpm check` yalnız Node ister.
- Mimari: git içinde JSON (`data/`), GitHub Actions cron ile toplama, Cloudflare Pages ile yayın (`docs/adr/0004-json-actions-pages.md`). Hedef ve kilometre taşları: `docs/plan-trend-idea-stream.md`.
- `make` ve `rg` yok; dosya arama için Grep/Read kullan. Konsol Türkçe çıktısını mojibake gösterebilir; dosya içeriğini Read ile doğrula.
- Scratch dosyaları workspace içinde tutulur ve bitince silinir; `%TEMP%` kullanılmaz.
- GitHub ve npm registry erişimi var; kaynak API'leri (GitHub, HN, HF) bu makineden gerçek istekle denenebilir.

## Agent skills

### Issue tracker

Issue'lar GitHub Issues'ta tutulur (`ernem22/StartupHunt`, `gh` CLI). Ayrıntı: `docs/agents/issue-tracker.md`.

### Triage labels

Varsayılan beş triage etiketi kullanılır: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ayrıntı: `docs/agents/triage-labels.md`.

### Domain docs

Single-context: sözlük `GLOSSARY.md`, kararlar `docs/adr/` altında. Ayrıntı: `docs/agents/domain.md`.
