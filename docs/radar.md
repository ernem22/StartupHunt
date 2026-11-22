# Trend radar — #78 / #79 / #80

`pnpm radar` Markdown yazar. Her koşuda üç kaynak ayrı `stage_runs` kaydı olarak işlenir: GitHub (doğrulayıcı aile), HN Algolia (aday üretici aile) ve Hugging Face (kendi ivme ölçüsü). Önce `db/schema.sql` mevcut DB'ye de uygulanır; `DATABASE_URL` ve isteğe bağlı `GITHUB_TOKEN` süreç ortamından verilir. Radar `.env` yüklemez. PostgreSQL erişimi zorunludur; başarılı çıktı ancak snapshot transaction'ı tamamlanınca yazılır. Kaynaklar arası birebir birleştirme (#81) bu dilimde yoktur; GitHub, HN ve HF kartları ayrı satır kalır.

## Aday havuzu

Çalışan liste: `src/radar/github.ts` içindeki `candidatePool`.

| Ürün türü | Trend kaynakları | Gelir kaynakları | Lisans notu |
| --- | --- | --- | --- |
| Geliştirici aracı | GitHub Search, GitHub stargazers/history, HN Algolia | Yok (bu dilimde aranmaz) | Kişisel kullanım; repo lisansı ve HN bağlantıları ayrıca incelenir, kod ve marka kopyalanmaz. |
| Yapay zekâ modeli | Hugging Face trendingScore | Yok (bu dilimde aranmaz) | Kişisel kullanım; model lisansı ayrıca incelenir, kod ve marka kopyalanmaz. |

## GitHub kaynağı (doğrulayıcı)

`topic:developer-tools archived:false fork:false` sorgusunun güncellenme sırasındaki ilk 30 reposu keşif örneklemidir; ürün niteliği elle incelenir. Bu liste tüm GitHub'ın en hızlı 20 ürünü değildir. Örneklem içinde son iki tamamlanmış haftanın yıldız artış oranıyla ilk 20 seçilir; yeterli veri yoksa 20'den az olabilir. Negatif oranlar korunur. Önceki hafta sıfırsa oran tanımsızdır ve aday sıralamaya girmez; snapshot yine saklanır. Eşit oranlar repo adıyla sıralanır. JSON çıktısı eklenmedi (isteğe bağlı).

Son dört tamamlanmış UTC haftası kullanılır (Pazar başlangıcı); devam eden hafta karşılaştırılmaz. Eksik hafta sıfıra çevrilmez: dört haftası tamamlanmayan repo uyarıyla dışlanır. Search eksik sonuç döndürürse, history biçimi bozuksa veya HTTP/rate-limit hatası varsa koşu başarısız olur; kısmi liste yayımlanmaz. Yeniden deneme kullanıcıya bırakılır.

## HN Algolia kaynağı (aday üretici)

`developer` ve `AI tools` sorguları son dört tamamlanmış UTC haftasında `search_by_date` ile çekilir (`tags=story`, `hitsPerPage=1000`). Aynı `objectID` iki sorguda da görünürse bir kez sayılır. Her hikâye bağlantısının ürün kimliği çıkarılır: `github.com/<owner>/<repo>` repo URL'si, diğer bağlantılar kayıt dışı `www.` atılmış alan adı. İçerik yayınlayan alan adları (YouTube, X/Twitter, Medium, Substack, Reddit, arXiv, Wikipedia, LinkedIn, haber siteleri ve repo yolu taşımayan GitHub bağlantıları) `NON_PRODUCT_DOMAINS` engel listesiyle ürün sayılmaz; elenen bağlantı sayısı koşu çıktısında "Ürün olmadığı için elenen: N" satırıyla raporlanır. Ürün başına haftalık hikâye sayısı sparkline olur; ivme = (son hafta − önceki hafta) / önceki hafta. HN'de sıfır hafta gözlenmiş bir değerdir (o hafta hikâye yok), eksik veri değildir. Önceki haftası sıfır olan aday sıralamaya girmez. Bağlantısız (Ask HN) hikâyeler ve HTTP/biçim hataları atılmaz: hata koşuyu başarısız eder, kısmi liste yayımlanmaz. Sonuç global HN sıralaması değil, bu iki sorgunun keşif örneklemidir.

## Hugging Face kaynağı (ivme ölçüsü)

HF bir aday üretici ya da doğrulayıcı değil, kendi tek noktalık ivme ölçüsüdür; `RadarSource` ailesinde `ivme ölçüsü` olarak etiketlenir. [Hugging Face listing](https://huggingface.co/api/models?sort=trendingScore&limit=30) `sort=trendingScore&limit=30` parametresiyle ilk 30 modeli keşif örneklemidir; küresel ilk 20 iddiası değildir. HF API haftalık geçmiş sağlamaz: kart `trendingScore` (Hugging Face'in kendi son dönem ilgi ölçüsü) değeriyle sıralanır ve **doğrulandı** etiketi taşır; haftadan haftaya artış oranı `metric_snapshots`'a yazılan `hf_trending_score` snapshot'ları biriktikten sonra ayrı ticket'ta değerlendirilir. Snapshot `entity_type=hf_model`, `entity_id=model URL`, `captured_at=son tamamlanmış hafta başlığı` ile yazılır. Model adı yükleme beyanıdır (**ikincil**); `pipeline_tag`'den türeyen tür açıklaması **doğrulandı** (HF API alanı). `trendingScore` alanı eksik model uyarıyla dışlanır; listing HTTP hatası veya bozuksa koşu başarısız olur, kısmi liste yayımlanmaz. HF modelleri çoğunlukla repo URL'si taşımaz; GitHub satırlarıyla birleştirme yapılmaz, satırlar ayrı kalır.

## Koşu kaydı

Her koşu kaynak, sorgu/havuz, örneklem sınırı, zaman, tohum (rastgelelik yok: 0), commit hash ve durumunu `stage_runs` içine yazar. `pnpm radar` üç kaynak için üç manifest bırakır. DB bağlantısı kurulamazsa manifest yazılamaz ve komut başarısız olur. `metric_snapshots`: GitHub için `entity_type=github_repo`, `entity_id=repo URL`, `metric=weekly_new_stars`; HN için `entity_type=hn_domain`, `entity_id=ürün URL'si`, `metric=weekly_stories`; HF için `entity_type=hf_model`, `entity_id=model URL`, `metric=hf_trending_score`. `captured_at=hafta başlangıcı` (HF'de son tamamlanmış hafta). Tekrarlanan koşular ayrı snapshot kayıtları bırakır; haftalık değerler toplanmamalıdır.

Ad ve açıklama kaynağın beyanıdır (**ikincil**: GitHub'da repo sahibi, HN'de hikâye başlığı, HF'de model kimliği); haftalık veriden hesaplanan ivme **doğrulandı** olarak sunulur. Gelir kanıtı “yok”, TR durumu “belirsiz” ve ikisi de **doğrulanmadı (aranmadı)** yer tutucudur; bu alanlardaki URL kontrol edilecek adayın referansıdır, gelir/TR kanıtı değildir.

## Gerçek istek testleri

**Doğrulandı (2026-11-21):** tokensız gerçek isteklerde [GitHub Search](https://api.github.com/search/repositories?q=topic%3Adeveloper-tools+archived%3Afalse+fork%3Afalse&sort=updated&order=desc&per_page=30) HTTP 200 (`total_count=93559`, `incomplete_results=false`); [vscode history](https://api.github.com/repos/microsoft/vscode/stargazers/history?per_page=5) HTTP 200, beş haftalık nesne. **Doğrulandı (doküman):** [GitHub REST referansı](https://docs.github.com/en/rest/activity/starring#get-repository-star-history) history alanlarını ve uç noktayı tanımlar.

**Doğrulandı (2026-11-21):** HN Algolia `search_by_date`, `created_at_i` penceresi 2026-10-18–2026-11-15, `hitsPerPage=1000`:
- `query=developer` → HTTP 200, `nbHits=362`, dönen hit 362; örnek: `objectID=50501205`, `2026-11-14T21:41:51Z`, `https://github.com/aturley/zoom-r8-hardware-and-firmware`.
- `query=AI tools` → HTTP 200, `nbHits=318`, dönen hit 318; örnek: `objectID=50498487`, `2026-11-14T16:51:53Z`, `https://agentcommand.gg/`.
- Uç nokta: `https://hn.algolia.com/api/v1/search_by_date?query=developer&tags=story&numericFilters=created_at_i%3E%3D1792281600,created_at_i%3C%3D1794700800&hitsPerPage=1000` (bitiş filtresi kodda `<`).

**Doğrulandı (2026-11-21):** tokensız gerçek istek [HF listing](https://huggingface.co/api/models?sort=trendingScore&limit=30) HTTP 200; örnek satır `id=thinkingmachines/Inkling-2-Mini`, `trendingScore=1002`, `downloads=7944`, `pipeline_tag=image-text-to-text`. `likes`, `downloads`, `pipeline_tag`, `createdAt` alanları listing yanıtında gözlemlendi. Uç noktayı tanımlayan HF dokümanı bu kayıtta ayrıca okunmadı (**doğrulanmadı**).

Bunlar DB uçtan uca doğrulaması değildir.

**Doğrulanmadı:** DB bağlantısı, şema uygulaması ve gerçek `pnpm radar` çıktısının PostgreSQL'e yazılması bu makinede doğrulanamadı (3060'ta koşulacak). 3060'ta şemayı uygula, `pnpm radar` çalıştır, son üç `stage_runs` manifestini ve GitHub `github_repo`/HN `hn_domain`/HF `hf_model` snapshot kayıtlarını karşılaştır. Gelir/TR araması #82/#84 kapsamındadır; kaynaklar arası birleştirme #81 kapsamındadır.
