# GitHub radar — #78

`pnpm radar` Markdown yazar. Önce `db/schema.sql` mevcut DB'ye de uygulanır; `DATABASE_URL` ve isteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir. Radar `.env` yüklemez. PostgreSQL erişimi zorunludur; başarılı çıktı ancak snapshot transaction'ı tamamlanınca yazılır.

## Aday havuzu

Çalışan liste: `src/radar/github.ts` içindeki `candidatePool`.

| Ürün türü | Trend kaynakları | Gelir kaynakları | Lisans notu |
| --- | --- | --- | --- |
| Geliştirici aracı | GitHub Search, GitHub stargazers/history | TrustMRR `/api/ai` (anahtarsız, salt okunur; aday başına sıkı domain/ad eşleşmesi) | Kişisel kullanım; her repo lisansı ayrıca incelenir, kod ve marka kopyalanmaz. TrustMRR kişisel kullanımda sorun değildir; anahtar/LLM izni doğrulanmadı, veri LLM'e verilmez, kazıma yok; ticari kullanımda yeniden değerlendirilir. |

`topic:developer-tools archived:false fork:false` sorgusunun güncellenme sırasındaki ilk 30 reposu keşif örneklemidir; ürün niteliği elle incelenir. Bu liste tüm GitHub'ın en hızlı 20 ürünü değildir. Örneklem içinde son iki tamamlanmış haftanın yıldız artış oranıyla ilk 20 seçilir; yeterli veri yoksa 20'den az olabilir. Negatif oranlar korunur. Önceki hafta sıfırsa oran tanımsızdır ve aday sıralamaya girmez; snapshot yine saklanır. Eşit oranlar repo adıyla sıralanır. JSON çıktısı eklenmedi (isteğe bağlı).

Son dört tamamlanmış UTC haftası kullanılır (Pazar başlangıcı); devam eden hafta karşılaştırılmaz. Eksik hafta sıfıra çevrilmez: dört haftası tamamlanmayan repo uyarıyla dışlanır. Search eksik sonuç döndürürse, history biçimi bozuksa veya HTTP/rate-limit hatası varsa koşu başarısız olur; kısmi liste yayımlanmaz. Yeniden deneme kullanıcıya bırakılır.

Her koşu kaynak, sorgu/havuz, örneklem sınırı, zaman, tohum (rastgelelik yok: 0), commit hash ve durumunu `stage_runs` içine yazar. DB bağlantısı kurulamazsa manifest yazılamaz ve komut başarısız olur. `metric_snapshots`: `entity_type=github_repo`, `entity_id=repo URL`, `metric=weekly_new_stars`, `captured_at=hafta başlangıcı`. Tekrarlanan koşular ayrı snapshot kayıtları bırakır; haftalık değerler toplanmamalıdır.

Ad ve açıklama repo sahibinin beyanıdır (**ikincil**); haftalık yıldızlardan hesaplanan ivme **doğrulandı** olarak sunulur.

**Gelir kanıtı (#82):** Her kartta kaynak URL'si, tarih ve kanıt etiketiyle gelir kanıtı alanı vardır. `pnpm radar`, TrustMRR'nin anahtarsız salt okunur `GET /api/ai` ucuna gerçek istek atar. Eşleme aday başına ve sıkıdır: GitHub adayının `homepage` domain'i TrustMRR `website` domain'iyle aynıysa ya da normalize ad/slug tam eşitse kayıt eşleşir; substring/benzerlik kabul edilmez. Eşleşme yoksa bulgu **"yok"** ve etiket **doğrulanmadı (N kayıtlık örnekte eşleşme yok, kapsam sınırlı, bu bir kanıt değil)** yazılır — bu bir gelir kanıtı değildir. Eşleşme varsa ve `revenue` içinde MRR/son 30 gün/toplam alanları varsa bunlar **ikincil** olarak yazılır; eşleşme olup gelir alanı yoksa bu açıkça yazılır. 5xx/beklenmeyen HTTP koşuyu başarısız eder (uydurma yok). Geliştirici aracı / yapay zekâ türünde "yok" kabul edilebilir sonuçtur (ADR 0003). Kod `.env` okumaz, token gömmez veya okumaz; TrustMRR verisi LLM'e verilmez. Karttaki repo URL'si yalnızca aday referansıdır, gelir kanıtı değildir.

TR durumu “belirsiz” ve **doğrulanmadı (aranmadı)** yer tutucudur; bu alandaki repo URL'si kontrol edilecek adayın referansıdır, TR kanıtı değildir.

**Doğrulandı (2026-11-21):** tokensız gerçek isteklerde [GitHub Search](https://api.github.com/search/repositories?q=topic%3Adeveloper-tools+archived%3Afalse+fork%3Afalse&sort=updated&order=desc&per_page=30) HTTP 200 (`total_count=93559`, `incomplete_results=false`); [vscode history](https://api.github.com/repos/microsoft/vscode/stargazers/history?per_page=5) HTTP 200, beş haftalık nesne. **Doğrulandı (doküman):** [GitHub REST referansı](https://docs.github.com/en/rest/activity/starring#get-repository-star-history) history alanlarını ve uç noktayı tanımlar. Bunlar DB uçtan uca doğrulaması değildir.

**Doğrulandı (2026-11-21, gerçek istek — #82):** `GET https://trustmrr.com/api/v1/startups?limit=3` (anahtarsız) → **HTTP 401**, gövde `{"error":"Missing or invalid API key. Pass it as: Authorization: Bearer tmrr_..."}`. `GET https://trustmrr.com/api/ai` (anahtarsız) → **HTTP 200**, ~72 KB JSON; üst anahtarlar `metricAccess`, `recentlyListedStartups` (25), `bestDeals` (25); kayıt alanları arasında `name`, `slug`, `url`, `website`, `revenue.last30Days`, `revenue.mrr`, `revenue.total` var (`metricAccess.public` bu özet metriklerin dönebileceğini söylüyor). **Doğrulanmadı:** TrustMRR anahtarlı uçlar, fiyat/LLM izni; `/api/ai` kapsamı 50 kayıtlık örnekle sınırlı olduğu için eşleşme yokluğu kanıt sayılmaz.

**Doğrulanmadı:** DB bağlantısı, şema uygulaması ve gerçek `pnpm radar` çıktısının PostgreSQL'e yazılması bu makinede doğrulanamadı (3060'ta koşulacak). 3060'ta şemayı uygula, `pnpm radar` çalıştır, son `stage_runs` manifestini ve repo başına dört `metric_snapshots` kaydını karşılaştır. Gelir/TR araması ve diğer kaynaklar #78 kapsamı dışındadır.
