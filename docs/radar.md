# Trend radar — #78 (GitHub) + #80 (Hugging Face)

`pnpm radar` Markdown yazar. Önce `db/schema.sql` mevcut DB'ye de uygulanır; `DATABASE_URL` ve isteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir. Radar `.env` yüklemez. PostgreSQL erişimi zorunludur; başarılı çıktı ancak snapshot transaction'ı tamamlanınca yazılır.

## Aday havuzu

Çalışan liste: `src/radar/github.ts` içindeki `candidatePool`.

| Ürün türü | Trend kaynakları | Gelir kaynakları | Lisans notu |
| --- | --- | --- | --- |
| Geliştirici aracı | GitHub Search, GitHub stargazers/history | Yok (bu dilimde aranmaz) | Kişisel kullanım; her repo lisansı ayrıca incelenir, kod ve marka kopyalanmaz. |
| Yapay zekâ modeli | Hugging Face trendingScore | Yok (bu dilimde aranmaz) | Kişisel kullanım; model lisansı ayrıca incelenir, kod ve marka kopyalanmaz. |

`topic:developer-tools archived:false fork:false` sorgusunun güncellenme sırasındaki ilk 30 reposu keşif örneklemidir; ürün niteliği elle incelenir. Bu liste tüm GitHub'ın en hızlı 20 ürünü değildir. Örneklem içinde son iki tamamlanmış haftanın yıldız artış oranıyla ilk 20 seçilir; yeterli veri yoksa 20'den az olabilir. Negatif oranlar korunur. Önceki hafta sıfırsa oran tanımsızdır ve aday sıralamaya girmez; snapshot yine saklanır. Eşit oranlar repo adıyla sıralanır. JSON çıktısı eklenmedi (isteğe bağlı).

Son dört tamamlanmış UTC haftası kullanılır (Pazar başlangıcı); devam eden hafta karşılaştırılmaz. Eksik hafta sıfıra çevrilmez: dört haftası tamamlanmayan repo uyarıyla dışlanır. Search eksik sonuç döndürürse, history biçimi bozuksa veya HTTP/rate-limit hatası varsa koşu başarısız olur; kısmi liste yayımlanmaz. Yeniden deneme kullanıcıya bırakılır.

Her koşu kaynak, sorgu/havuz, örneklem sınırı, zaman, tohum (rastgelelik yok: 0), commit hash ve durumunu `stage_runs` içine yazar. DB bağlantısı kurulamazsa manifest yazılamaz ve komut başarısız olur. `metric_snapshots`: `entity_type=github_repo`, `entity_id=repo URL`, `metric=weekly_new_stars`, `captured_at=hafta başlangıcı`. Tekrarlanan koşular ayrı snapshot kayıtları bırakır; haftalık değerler toplanmamalıdır.

Ad ve açıklama repo sahibinin beyanıdır (**ikincil**); haftalık yıldızlardan hesaplanan ivme **doğrulandı** olarak sunulur. Gelir kanıtı “yok”, TR durumu “belirsiz” ve ikisi de **doğrulanmadı (aranmadı)** yer tutucudur; bu alanlardaki repo URL'si kontrol edilecek adayın referansıdır, gelir/TR kanıtı değildir.

**Doğrulandı (2026-11-21):** tokensız gerçek isteklerde [GitHub Search](https://api.github.com/search/repositories?q=topic%3Adeveloper-tools+archived%3Afalse+fork%3Afalse&sort=updated&order=desc&per_page=30) HTTP 200 (`total_count=93559`, `incomplete_results=false`); [vscode history](https://api.github.com/repos/microsoft/vscode/stargazers/history?per_page=5) HTTP 200, beş haftalık nesne. **Doğrulandı (doküman):** [GitHub REST referansı](https://docs.github.com/en/rest/activity/starring#get-repository-star-history) history alanlarını ve uç noktayı tanımlar. Bunlar DB uçtan uca doğrulaması değildir.

**Doğrulanmadı:** DB bağlantısı, şema uygulaması ve gerçek `pnpm radar` çıktısının PostgreSQL'e yazılması bu makinede doğrulanamadı (3060'ta koşulacak). 3060'ta şemayı uygula, `pnpm radar` çalıştır, son `stage_runs` manifestini ve repo başına dört `metric_snapshots` kaydını karşılaştır. Gelir/TR araması ve diğer kaynaklar #78 kapsamı dışındadır.

## Hugging Face kaynakları — #80

`pnpm radar` GitHub bölümünün ardından ayrı bir `# Hugging Face adayları` bölümü yazar; her kaynak kendi `stage_runs` manifestini alır ve bir kaynak başarısız olursa çıktı yayımlanmaz (tamamlanan kaynağın snapshot'ları DB'de kalır). Aday havuzuna "yapay zekâ modeli" türü ve HF girdisi eklendi (`candidatePool`).

[Hugging Face listing](https://huggingface.co/api/models?sort=trendingScore&limit=30) `sort=trendingScore&limit=30` parametresiyle ilk 30 modeli keşif örneklemidir; küresel ilk 20 iddiası değildir. HF API haftalık geçmiş sağlamaz: kart ivmesi `trendingScore` (HF'in kendi son dönem ilgi ölçüsü) değeriyle sıralanır ve **doğrulandı** etiketi taşır; haftadan haftaya artış oranı `metric_snapshots`'a yazılan `hf_trending_score` snapshot'ları biriktikten sonra ayrı ticket'ta değerlendirilir. Snapshot `entity_type=hf_model`, `entity_id=model URL`, `captured_at=son tamamlanmış hafta başlığı` ile yazılır. Model adı yükleme beyanıdır (**ikincil**); `pipeline_tag`'den türeyen tür açıklaması **doğrulandı** (HF API alanı). `trendingScore` alanı eksik model uyarıyla dışlanır; listing HTTP hatası veya bozuksa koşu başarısız olur, kısmi liste yayımlanmaz. HF modelleri çoğunlukla repo URL'si taşımaz; GitHub satırlarıyla birleştirme yapılmaz, satırlar ayrı kalır.

**Doğrulandı (2026-11-21):** tokensız gerçek istek [HF listing](https://huggingface.co/api/models?sort=trendingScore&limit=30) HTTP 200; örnek satır `id=thinkingmachines/Inkling-2-Mini`, `trendingScore=1002`, `downloads=7944`, `pipeline_tag=image-text-to-text`. `likes`, `downloads`, `pipeline_tag`, `createdAt` alanları listing yanıtında gözlemlendi. Uç noktayı tanımlayan HF dokümanı bu kayıtta ayrıca okunmadı (**doğrulanmadı**).

**Doğrulanmadı:** DB yazımı, `stage_runs`/`metric_snapshots` karşılaştırması ve gerçek `pnpm radar` çıktısında HF bölümünün görünmesi PostgreSQL gerektirdiğinden bu makinede doğrulanamadı (3060'ta koşulacak). Haftalık artış oranı ve gelir/TR araması bu ticket kapsamı dışındadır.
