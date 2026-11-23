# StartupHunt

Küresel olarak yükselen ürünleri veriyle (sayı + kaynak linki) listeleyen ve Türkiye pazarının o ürün için ne kadar dolu olduğunu gösteren kişisel trend radarı. Plan: `docs/plan-trend-idea-stream.md`.

## Gereksinimler

Node 22 (`.nvmrc`), pnpm 12. Veritabanı, Docker ya da Python gerekmez.

## Kullanım

```bash
pnpm install --frozen-lockfile
pnpm radar   # GitHub/HN/HF'den çeker; Markdown basar, data/latest.json ve data/YYYY-MM-DD.json yazar
pnpm check   # lint, format, typecheck, encoding, test
```

Mimari: git içinde JSON, GitHub Actions günlük toplama, Cloudflare Pages yayın (`docs/adr/0004-json-actions-pages.md`). Actions ve Pages henüz kurulu değil (M5).

## Dokümanlar

`AGENTS.md` ajan giriş noktası · `GLOSSARY.md` terimler · `docs/adr/` kararlar · `docs/radar.md` radar çıktısı · `docs/agents/` tracker ve iş akışı
