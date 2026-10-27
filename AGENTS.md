# AGENTS.md — StartupHunt

## Başlangıç

İş sırası: üzerinde çalışılan ticket → o özelliğin spec'i (#18) → `docs/adr/` → `GLOSSARY.md`. Tracker, triage ve repo iş akışı: `docs/agents/`. Kontroller: `pnpm check`.

## Ortam

- Windows (win32), PowerShell 5.1. Node v22.23.2, pnpm 12.11.2, Python 3.12.10.
- Docker CLI v29.8.0 kurulu ama daemon çalışmıyor (`docker info` başarısız). Postgres/pgvector, TEI, SearXNG ve BERTopic bu makinede yok; DB/embed/cluster doğrulaması 3060 PC'de yapılır — orada koşulmadan "çalışıyor" sayılmaz.
- `make` ve `rg` yok; dosya arama için Grep/Read kullan. Konsol Türkçe çıktısını mojibake gösterebilir; dosya içeriğini Read ile doğrula.
- Scratch dosyaları workspace içinde tutulur ve bitince silinir; `%TEMP%` kullanılmaz.
- GitHub ve npm registry erişimi var; canlı kaynak API'leri ve 3060 hizmetleri bu makineden doğrulanamaz.

## Agent skills

### Issue tracker

Issue'lar GitHub Issues'ta tutulur (`ernem22/StartupHunt`, `gh` CLI). Ayrıntı: `docs/agents/issue-tracker.md`.

### Triage labels

Varsayılan beş triage etiketi kullanılır: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Ayrıntı: `docs/agents/triage-labels.md`.

### Domain docs

Single-context: sözlük `GLOSSARY.md`, kararlar `docs/adr/` altında. Ayrıntı: `docs/agents/domain.md`.
