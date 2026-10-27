# Bilinen profil ve geri bildirim

## Status

accepted

## Context

Kullanıcı yalnızca "yeni" olanı görmek istiyor; zorunlu etiketleme ise kullanılmıyor. Aynı zamanda `review_status`/BU insan onayı olarak kalmalı ve LLM çıktısı bu alana karışmamalı.

## Decision

Bilinen profil, yerel dokümanlardan (`reports/`, `research_notes/`, `plan.md`, `LOG.md`, `docs/`) ağ ve LLM kullanılmadan, deterministik token/doküman frekansıyla kurulur. Kart başına `likely_new`, `uncertain` veya `likely_known` prior'ı ve kısa bir gerekçe üretilir; prior yalnızca digest sıralamasını değiştirir, kartı filtrelemez.

Geri bildirim append-only event olarak saklanır: `open`, `investigate`, `drop`, `knew`. Zorunlu etiket yoktur. Bir `drop`, aynı `opportunity_key`'i ve aynı aktör/iş ya da yakın problem metnini 8 hafta (env ile değiştirilebilir) digest'ten gizler; kanıt ve opportunity kayıtları silinmez. Hiçbir feedback yolu `review_status`/BU yazmaz.

## Consequences

- Profil, kullanıcının mevcut bilgi kabuğunu yansıtır; yeni kaynak eklendikçe kendiliğinden güncellenir.
- LLM sonradan yalnızca çıkarım katmanında kullanılabilir; prior deterministik kalır.
- "Vazgeçtim" geçicidir ve geri alınabilir; geçmiş kanıt denetlenebilir kalır.
- Sıralama kişiselleşir ama kapı ve kanıt kuralları herkes için aynı kalır.
