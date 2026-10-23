# Coding Standards

Review'da judgement-call için okunur; mekanik kontroller CI'da (`pnpm typecheck`, `pnpm test`).

1. **Türetilmiş alan tek kaynakta.** Aynı bilgiyi iki kolonda veya iki çıktı alanında tekrar etme; türetilmiş değeri kaynağından üret.
2. **Test ve fixture yeri.** Testler `test/`, fixture'lar `test/fixtures/` altında; smoke testleri dış davranışı doğrular.
3. **Tüketicisiz alan yok.** Bir kolon/alan ancak onu okuyan tüketici aynı PR'da geliyorsa eklenir; gelecek ticket için boş alan bırakma.
