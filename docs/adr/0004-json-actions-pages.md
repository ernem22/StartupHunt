# JSON depolama, GitHub Actions toplama, Cloudflare Pages yayın

## Status

accepted (2026-11-23; plan: `docs/plan-trend-idea-stream.md`)

## Context

Hedef: dünyada yükselen ürünleri veri ve kaynak linkiyle, TR doygunluğuyla listelemek. Aday listesi günde birkaç yüz satırdır. Eski Postgres/pgvector/TEI/BERTopic/Docker hattı bu makinede çalışmıyordu (Docker daemon yok), Cloudflare ücretsiz katmanında çalışmaz ve bu boyut için gereksizdi.

## Decision

- **Depolama:** git içinde JSON. `pnpm radar` `data/latest.json` ve `data/YYYY-MM-DD.json` yazar; ivme "dünkü ile bugünkü" farkıyla hesaplanır. Veritabanı yok, `DATABASE_URL` yok.
- **Toplama:** GitHub Actions günlük cron (M5) çıktıyı repoya commit'ler. Yerel yedek: aynı komut, Windows Task Scheduler.
- **Yayın:** Cloudflare Pages statik sayfa `latest.json`'u okur. Toplama Workers'a taşınmaz; Workers çıkış IP'sinin Apple/Play/Arctic Shift tarafından engellenip engellenmediği doğrulanmadı (M5'te denenir).
- **Silinenler:** Python, Docker, SearXNG, embedding/cluster, eski fırsat motoru, eski adaptörler; ADR 0001-0002 (superseded).

## Consequences

- `pnpm check` yalnız Node/TypeScript koşar; CI'da servis yok.
- Sorgu gerekirse D1 gibi bir şey sonradan eklenir; şimdi değil.
- Geçmiş git geçmişinde durur; eski kodu geri getirmek gerekirse oradan alınır.
