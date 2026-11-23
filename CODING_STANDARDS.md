# Coding Standards

Review'da judgement-call için okunur; mekanik kontroller `pnpm check` ile CI ve pre-commit'te koşar.

1. **Türetilmiş alan tek kaynakta.** Aynı bilgiyi iki çıktı alanında tekrar etme; türetilmiş değeri kaynağından üret.
2. **Testler dış davranışı doğrular.** İç fonksiyon yerine CLI/JSON çıktısını doğrula.
3. **Tüketicisiz alan yok.** Bir alan ancak onu okuyan tüketici aynı PR'da geliyorsa eklenir.
4. **Veri yolu replayable olmalı.** Aynı girdi ve parametreler aynı çıktıyı vermeli; manifest commit ve parametreleri taşır.
5. **Her iddia kaynak linki ve tarih taşır.** Kanıtsız sayı ya da hüküm yazılmaz.
