# StartupHunt

Topluluk metinlerinden kişisel kullanım için "araştırmaya değer fırsat" kuyruğu üreten motor.

## Gereksinimler

- Node 22.23.2 (`.nvmrc`), pnpm 12
- Python 3.12.10 (`.python-version`; kümeleme 3060 cihazında doğrulanır)
- Postgres/pgvector, TEI, SearXNG ve BERTopic yalnızca 3060 cihazında: `KURULUM.md`

## Kurulum

```bash
pnpm install --frozen-lockfile
```

`prepare` adımı Husky pre-commit hook'unu kurar; her commit `pnpm check` çalıştırır.

## Kontrol

```bash
pnpm check
```

TypeScript için lint, format kontrolü ve typecheck; tüm repo için encoding ve testler; Python için sözdizimi kontrolü çalıştırır. DB testleri `TEST_DATABASE_URL` yoksa gerekçeli atlanır; CI'da pgvector service ile koşar.

## Dokümanlar

- `AGENTS.md` — ajan giriş noktası ve ortam notları
- `GLOSSARY.md` — alan terimleri
- `docs/adr/` — geri alınması zor kararlar
- `docs/agents/` — tracker, triage ve iş akışı
- `plan.md` — güncel plan; `LOG.md` — geliştirme günlüğü
