# StartupHunt — Repo ve Uygulanabilirlik Denetimi

> **Kapsam:** Kullanıcı tarafından sağlanan `capraz_denetim_metni.md` içindeki repo'ya dokunan teknik iddiaların ve P0–P2 önerilerinin `C:\Users\zurza\orca\workspaces\StartupHunt\spookfish` deposuyla karşılaştırılması.
> **Yöntem:** Salt-okunur denetim. Kod değiştirilmedi. Tüm repo iddiaları `dosya:satır` ile; kod alıntıları birebir.
> **Donanım sınırı:** `AGENTS.md:4-6` — bu cihaz HUAWEI laptop (Ryzen 5, 8 GB, GPU yok, WSL2/Docker yok); DB/embed/cluster runtime doğrulaması burada yapılamaz, 3060 PC'de yapılır. Bu notta "3060" etiketi bunu taşır.
> **Tarih:** 21 Ekim 2026.

## Hüküm tablosu

| # | Çapraz denetimdeki iddia / öneri | Hüküm | Kanıt | Kısa gerekçe |
|---|---|---|---|---|
| 1 | Mevcut kod UMAP(15, 10, cosine, 42) + HDBSCAN(25, 10, eom) kullanıyor | **DOĞRU** (sayılar) | `cluster/recluster.py:35-39`, `120-133` | Sayılar repo ile birebir. Ancak bu cümle `capraz_denetim_metni.md` içinde değil; önceki denetim notlarında (`reports/Startup fikri yakalama tekniklerinin eleştirisi.md:167`, `research_notes/Startup fikri yakalama tekniklerinin eleştirisi/kumeleme_ve_teknik_denetim.md:40`) geçiyor. |
| 2 | "UMAP eksik anlatım" | **YANLIŞ** (repo için) | `cluster/recluster.py:120-126`, `plan.md:242` | Repo UMAP'i zaten kullanıyor. Eksik olan UMAP, orijinal rapordur; repo değil. |
| 3 | `min_cluster_size=5 + epsilon≈0 + leaf` reçetesi | **KAYNAKTA YOK** (repo'da) | `cluster/recluster.py:37`, `127-133` | Repo `mcs=25`, `eom`; `cluster_selection_epsilon` hiç verilmemiş (varsayılan 0.0). Eleştiri orijinal raporun reçetesine yönelik doğru; repo bu reçeteyi kullanmıyor. |
| 4 | HDBSCAN parametreleri veri ölçeğine göre kalibre edilmeli | **KISMEN** | `plan.md:243`, `533-534`; `LOG.md:29` | Kodda sabit 25/10; kalibrasyon plan'da açık ölçüm. Pilot 54.579 obs'ta noise %44 — planın %40 eşiğinin üstünde. |
| 5 | Cosine 0.55 evrensel eşik | **DOĞRU** (kodda sabit) / **KISMEN** (belge) | `cluster/assign.py:23`, `95-102`; `AGENTS.md:31`; `LOG.md:422` | Kodda hardcoded sabit; `config.py`/`src/config.ts`/`plan.md` içinde sayı yok. Belgeler "pilotla kalibre edilecek" diyor. |
| 6 | Centroid ataması yanlış; `BERTopic.transform` + `approximate_predict` kullanılmalı | **KISMEN** | `cluster/recluster.py:132`, `151`, `192-193`; `cluster/assign.py:95-102` | BERTopic var; `transform` yok. Repo'nun centroid'i BERTopic'in iç centroid'i değil, üyelerin açık aritmetik ortalaması. Transform alternatifi makul ama üstünlüğü kanıtsız; model persist edilmiyor. |
| 7 | `BERTopic.transform` bu kodda kullanılmıyor | **DOĞRU** | `cluster/recluster.py:151`; `cluster/assign.py:95-102` | Yalnızca `fit_transform` var; `approximate_predict` hiç yok. `prediction_data=True` set edilmiş ama kullanılmıyor. |
| 8 | "Deterministik veri yolu" yanlış adlandırma | **DOĞRU** (etiket) / **KISMEN** (kapsam) | `AGENTS.md:26`; `plan.md:540`, `369`, `541` | Geniş iddia clustering için tutmuyor; doğru terim "replayable". Repo zaten `plan.md:369`'da HDBSCAN için "deterministik değildir" diyor (yanlış bileşen; asıl stokastik olan UMAP). |
| 9 | Run manifest, model sürüm pinleme, `random_state` logu, snapshot hash yok | **DOĞRU** | `cluster/recluster.py:39`, `118`; `cluster/requirements.txt:4`; `docker-compose.yml:30-32`; `db/schema.sql:105-111` | Manifest/`run_id` yok; sürümler `>=`; TEI imajı pinli ama model etiketi değil; snapshot hash yok. |
| 10 | `CountVectorizer(stop_words="english")` | **DOĞRU** | `cluster/recluster.py:138` | Türkçe metinde Türkçe stopword'leri temizlemez. Etki alanı c-TF-IDF etiketleri; küme üyeliği değil. |
| 11 | Türkçe stopword/lemma/Zemberek yok | **DOĞRU** | `cluster/recluster.py:138`; `src/language.ts:6`; grep: `.py` içinde Zemberek yok | `tur` tespiti var, Türkçe işleme yok. |
| 12 | Şemada dil alanı yok | **YANLIŞ** | `db/schema.sql:27`, `37` | `language text` ve index var. Ancak kümeleme dili filtrelemiyor. |
| 13 | Burst / G-test / BH-FDR kanalı var | **KAYNAKTA YOK** | grep: `burst|G-test|BH-FDR|changepoint|Isconna|FOCuS` `.py` içinde 0; `plan.md:377-380` | Repo'da burst kodu hiç yok; yalnızca recluster tetiği var. |
| 14 | LLM `review_status` yazıyor | **YANLIŞ** / zaten engelli | `src/review.ts:12-15`, `168-177`; `plan.md:269`, `544` | Repo'da LLM kodu yok; tek yazar insan HTTP eylemi. |
| 15 | LLM jüri önerisi | **KISMEN UYUMLU** | `plan.md:269`, `544` | Yalnızca kuyruk/kanıt üretirse uyumlu; üyelik/öncelik/eleme kararı verirse "veri yolu" olur, ilkeyle çelişir. |
| 16 | Revize sinyal hiyerarşisi | **KISMEN** | `plan.md:268`, `285`, `540` | `signal_types` etiketi olarak uyumlu; skor/sıralama olarak çelişir. |
| 17 | Stabilite kriteri (en az 2 komşu parametre seti) | **KISMEN / DENEY** | `LOG.md:36-38`; `plan.md:359` | ARI 0.703 (seed), 0.521 (%80 alt-örneklem); kriter tanımsız. Pattern gizleme aracı olursa filtre olur. |
| 18 | Kalibre edilmiş eşikler | **KISMEN** | `AGENTS.md:31`; `plan.md:574`; `cluster/assign.py:3-4` | Atama eşiği zaten açık ölçüm; düşen obs silinmiyor, recluster'a kalıyor. Pattern eleme eşiği olursa filtre. |
| 19 | `mcs=15–60` grid | **KISMEN / DENEY** | `cluster/recluster.py:37`; `LOG.md:29-30`; `plan.md:554` | 25 zaten aralıkta. 54.6k'da asıl sorun mikro-küme değil, %44 noise ve 1024 üyelik mega-cluster. |
| 20 | `min_topic_size=100–500` | **KAYNAKTA YOK / uygun değil** | `cluster/recluster.py:127-133`, `140-149` | Özel HDBSCAN verildiği için BERTopic'in `min_topic_size`'ı kullanılmıyor; kodda hiç geçmiyor. `mcs`'ye çevrilirse 50k ölçeğinde çok kaba olur. |
| 21 | TopicGPT tarzı "1–2K yüksek değerli belge" | **KISMEN / ölçek uyumsuz** | `plan.md:554`; `LOG.md:26-30` | 50k pilotta 1–2K, korpusun %2–4'ü; alt küme seçimi filtre/sıralama olur. |
| 22 | Kısa metinleri thread/user/observation bazında havuzla | **KISMEN** | `src/adapters/hackernews.ts:96`; `src/adapters/reddit-backfill.ts:114-123` | HN'de `parent_story_id` var; Reddit'te yalnızca `crosspost_parent_id`; user bazlı havuzlama yok. |
| 23 | `license_id`, `ai_use_allowed`, `attribution_required`, `retention_policy`, `deletion_request_supported` şemada | **YANLIŞ** | `db/schema.sql:27-32`, `plan.md:150` | First-class alan yok; yalnızca `metadata jsonb` escape hatch'i var. `raw_observations` immutable, silme talebiyle çelişir. |
| 24 | `source_snapshot_hash` | **YANLIŞ** (yok) | `src/db.ts:87-97`; `db/schema.sql:30` | Yalnızca kayıt başına FNV-1a `content_hash` var; snapshot hash yok. |
| 25 | Reddit 2027 / ekşi'yi LLM hattından çıkar | **KISMEN / KAYNAKTA YOK** | `plan.md:62`; grep: ekşi adapter yok | Reddit Arctic Shift'te var; ekşi repoda hiç yok. Bu bir politika kararı, kod değişikliği değil. |
| 26 | LLM'in `review_status` yazmasını engelle (P0.5) | **ZATEN DOĞRU** | `src/review.ts:168-177`; LLM kodu yok | Yapısal olarak sağlanmış; DB CHECK constraint/rol ayrımı yok. |
| 27 | Centroid argmax, insan etiketli örneklemde geçmeli | **DOĞRU eksik / DOĞRULANAMAZ** | `LOG.md:80` | İnsan etiketi yok: 250 aktif, 2 junk; "BU" sayısı bu log satırında yok. |
| 28 | Her pattern için 3–5 temsilci alıntı + URL + tarih + dil + güven notu | **KISMEN** | `src/review.ts:32-50`; `plan.md:362` | Repo 8 temsili gösteriyor (en yakın 5 + en yeni 3); URL/tarih var; dil ve güven notu yok. |

**Hüküm tanımları:** `DOĞRU` = repo ile uyumlu; `YANLIŞ` = repo ile çelişiyor; `ESKİMİŞ` = repo'da karşılığı kalmamış/legacy; `KAYNAKTA YOK` = repo'da böyle bir şey yok veya iddia repo'ya ait değil; `KISMEN` = yön doğru, kapsam/uygulama eksik.

---

## Ayrıntılar

### 1. Kümeleme: UMAP + HDBSCAN ve gerçek parametreler

**Kısa hüküm:** Evet, aktif recluster hattı BERTopic üzerinden UMAP + HDBSCAN çalıştırıyor. Çapraz denetimin verdiği UMAP reçetesi (15, 10, cosine, 42) repo'dakiyle birebir aynı; HDBSCAN tarafında da (25, 10, eom) doğru. Ancak çapraz denetimin asıl eleştirdiği `mcs=5 + epsilon≈0 + leaf` kombinasyonu repo'da **yok**; o, orijinal raporun önerisiydi.

`cluster/recluster.py:23` BERTopic'i, `:24` HDBSCAN'ı, `:26` UMAP'i import ediyor. Parametreler:

```python
UMAP_N_NEIGHBORS = 15
UMAP_N_COMPONENTS = 10
HDBSCAN_MIN_CLUSTER_SIZE = 25
HDBSCAN_MIN_SAMPLES = 10
RANDOM_STATE = 42  # tekrarlanabilirlik — plan kararı
OVERLAP_MIN = 0.50  # pattern_history eşleşme eşiği (plan FAZ 13 kararı)
TRANSFER_MIN = 0.50  # review_status taşınma aynı eşikle
```
— `cluster/recluster.py:35-41`

UMAP çağrısı:

```python
umap_model = UMAP(
    n_neighbors=UMAP_N_NEIGHBORS,
    n_components=UMAP_N_COMPONENTS,
    min_dist=0.0,
    metric="cosine",
    random_state=RANDOM_STATE,
)
```
— `cluster/recluster.py:120-126`

HDBSCAN çağrısı:

```python
hdbscan_model = HDBSCAN(
    min_cluster_size=HDBSCAN_MIN_CLUSTER_SIZE,
    min_samples=HDBSCAN_MIN_SAMPLES,
    metric="euclidean",
    cluster_selection_method="eom",
    prediction_data=True,
)
```
— `cluster/recluster.py:127-133`

**Tam parametre tablosu:**

| Parametre | Gerçek değer | Kanıt |
|---|---|---|
| `n_neighbors` | 15 | `recluster.py:35`, `121` |
| `n_components` | 10 | `recluster.py:36`, `122` |
| UMAP `min_dist` | 0.0 | `recluster.py:123` |
| UMAP `metric` | `"cosine"` | `recluster.py:124` |
| UMAP `random_state` | 42 | `recluster.py:39`, `125` |
| HDBSCAN `min_cluster_size` | 25 | `recluster.py:37`, `128` |
| HDBSCAN `min_samples` | 10 | `recluster.py:38`, `129` |
| HDBSCAN `metric` | `"euclidean"` (UMAP uzayında) | `recluster.py:130` |
| HDBSCAN `cluster_selection_method` | `"eom"` | `recluster.py:131` |
| HDBSCAN `cluster_selection_epsilon` | Verilmemiş → kütüphane varsayılanı 0.0 | `recluster.py:127-133` (parametre yok) |
| HDBSCAN `prediction_data` | `True` | `recluster.py:132` |
| BERTopic `calculate_probabilities` | `False` | `recluster.py:147` |
| BERTopic `low_memory` | `True` | `recluster.py:148` |
| BERTopic `min_topic_size` | Verilmemiş; özel HDBSCAN verildiği için granülarite `HDBSCAN_MIN_CLUSTER_SIZE` ile | `recluster.py:127-133`, `140-149` |
| `CountVectorizer` | `stop_words="english"`, `ngram_range=(1, 2)`, `min_df=1` | `recluster.py:138` |

**Çapraz denetimle farklar:**

- Çapraz denetim `UMAP(15, 10, cosine, 42)` diyor; repo buna ek olarak `min_dist=0.0` kullanıyor. Bu, cross-audit'in reçetesinde eksik ama repo'da mevcut.
- Çapraz denetim `HDBSCAN(25, 10, eom)` diyor; repo buna ek olarak `metric="euclidean"` ve `prediction_data=True` kullanıyor.
- Çapraz denetim `epsilon≈0` eleştirisini `mcs=5 + leaf` ile birlikte yapıyor. Repo `mcs=25 + eom`; bu kombinasyonda `epsilon=0` (varsayılan) zaten olağan. Yani `epsilon≈0` tek başına repo için "yanlış" değil.
- Çapraz denetim `min_topic_size=100–500` öneriyor. Repo özel HDBSCAN geçtiği için BERTopic'in `min_topic_size` parametresi devrede değil; kodda hiç geçmiyor (`recluster.py:140-149`). Doğru eşdeğer `HDBSCAN_MIN_CLUSTER_SIZE`'dır.
- `LOG.md:414` eski bir kayıt olarak `min_df 5` ve `KeyBERTInspired representation` diyor; güncel kod `min_df=1` ve representation model yok (`recluster.py:138`, `144-146`). Bu **ESKİMİŞ** bir log satırı; güncel davranış değil.

**Ölçek notu:** 54.579 obs, 252 pattern, %44 noise (`LOG.md:29`). `mcs=25` korpusun %0,046'sı; `mcs=15` %0,027; `mcs=60` %0,11. `min_topic_size=100–500` (eşdeğer `mcs` olarak) ise %0,18–0,92'ye denk gelir; ortalama pattern büyüklüğü ~121 obs olduğu için (`54.579 × 0,56 / 252 ≈ 121`) 100–500 aralığı bu ölçekte "nadir sinyal" değil, "sadece dev kümeler" üretir. Bu bir çıkarımdır; 3060'ta grid ile doğrulanmalı.

### 2. Günlük atama, 0.55 ve `BERTopic.transform`

**Kısa hüküm:** Günlük atama gerçekten centroid tabanlı ve cosine eşikli. `0.55` kodda sabit bir `SIMILARITY_THRESHOLD`; config'te veya plan'da sayı olarak yok. `BERTopic.transform` **kullanılmıyor**; ama repo BERTopic kullanıyor — yani çapraz denetimin BERTopic varsayımı stack açısından yanlış değil, eksik: model persist edilmediği için `transform` bugünkü mimariye doğrudan takılamaz.

**Akış:**

1. Recluster, her topic için üyelerin embedding ortalamasını alıp normalize ediyor ve `patterns.centroid` olarak yazıyor:
   ```python
   centroid = embeddings[members].mean(axis=0)
   centroid = (centroid / np.linalg.norm(centroid)).tolist()
   ```
   — `cluster/recluster.py:192-193`
2. Assign, aktif pattern'lerin centroid'lerini ve `status='embedded'` olup aktif bir pattern'a bağlı olmayan observation'ları okuyor — `cluster/assign.py:45-79`.
3. Cosine skoru:
   ```python
   def norm(m):
       return m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-10)

   sims = norm(obs_vecs) @ norm(centroids).T  # (n_obs, n_pat)
   ```
   — `cluster/assign.py:92-95`
4. Argmax + eşik:
   ```python
   j = int(np.argmax(sims[i]))
   if sims[i][j] >= SIMILARITY_THRESHOLD:
   ```
   — `cluster/assign.py:101-102`

**0.55 nereden geliyor?**

- Kod: `SIMILARITY_THRESHOLD = 0.55` — `cluster/assign.py:23`.
- Kod yorumu: `# Eşik: 0.55 — pilot veriyle kalibre edilecek (TR/EN çift testi sonrası).` — `cluster/assign.py:7`.
- Config'te yok: `config.py` içinde 0.55 yok; `src/config.ts` içinde yok; `plan.md` içinde sayı olarak yok. Plan yalnızca "eşik üstü" (`plan.md:374`) ve "centroid similarity ... pilot çıktısıyla elle yapılır" (`plan.md:574`) diyor.
- Dokümanlarda: `AGENTS.md:31` "assign eşik(0.55)"; `LOG.md:422` "eşik 0.55 — pilot ile kalibre edilecek".
- Yani tek gerçek kaynak kod sabiti; belgeler onu "açık ölçüm" olarak işaretliyor. Bu, çapraz denetimin "evrensel eşik" eleştirisini haklı çıkarır, ama repo bunu zaten "kalibre edilecek" diye biliyor.

**Cosine mi?** Evet. Her iki taraf normalize edilip iç çarpım alınıyor (`assign.py:92-95`); `patterns.centroid` yazılırken de normalize edilmiş (`recluster.py:192-193`). `pattern_observations.similarity` bu cosine değerini saklıyor (`db/schema.sql:62`; `assign.py:106-110`). İkinci en iyi skor/margin saklanmıyor; yalnızca en iyi skor var.

**`BERTopic.transform` kullanılıyor mu?** Hayır. Kodda yalnızca:

```python
topics, _ = topic_model.fit_transform(docs, embeddings)
```
— `cluster/recluster.py:151`

`transform(` veya `approximate_predict` çağrısı yok (grep: `cluster/` içinde yalnızca `fit_transform`). `prediction_data=True` (`recluster.py:132`) set edilmiş ama hiç kullanılmıyor. Olasılık/margin davranışı `calculate_probabilities` ve `prediction_data` ayarlarına bağlı; bugün ilki `False` (`recluster.py:147`).

**Pipeline "custom" mu, BERTopic mi?** Aktif recluster BERTopic'tir: `BERTopic(...)` + `fit_transform` (`recluster.py:140-151`). Embedding tarafı TEI/Qwen3'tür (`src/pipeline/embed.ts:8-10`, `docker-compose.yml:32`), `sentence-transformers` değil. `sentence-transformers` yalnızca legacy `embedding.py:59` ve 384 boyutlu `raw_items` hattında (`embedding.py:19`, `config.py:16`) duruyor; bu, `LOG.md:138`'de "phase2 proto legacy korundu — plan v3.2 mimaride yer tutmaz, bakım almaz" denen eski prototiptir. Yani aktif hat BERTopic + TEI; günlük atama ise BERTopic dışı, saf numpy centroid.

**Çapraz denetimin "BERTopic'te centroid garanti edilmez" eleştirisi:** Bu, BERTopic'in kendi iç temsilcisi için doğru olabilir; ama repo BERTopic'in centroid'ini kullanmıyor. `patterns.centroid`, üyelerin **açık aritmetik ortalaması** (`recluster.py:192`). Bu, küme şekli konkav/multi-modal ise zayıf bir temsilci olabilir; ama "BERTopic'in garantisi olmayan centroid'i" değildir. Ayrıca centroid yalnızca atamada değil, review server'ın temsili observation seçiminde de kullanılıyor (`src/review.ts:39`: `order by o.embedding <=> pt.centroid`; kural `plan.md:362`). Atama yöntemi değişse bile centroid review'da kalır.

**Doğru eşdeğer nedir?**

- BERTopic ile devam edilecekse: recluster sonunda modeli kalıcı hale getir (BERTopic serialization veya UMAP reducer + HDBSCAN clusterer), assign'te `topic_model.transform(docs, embeddings)` çağır; `approximate_predict` için `prediction_data=True` zaten hazır (`recluster.py:132`). Bugün model diske/DB'ye yazılmıyor; `recluster.py` her koşuda yeniden fit ediyor. Bu yüzden `transform` "doğrudan" takılamaz.
- Sınıflandırıcı alternatifi: insan onaylı pattern üyelerinden eğitilmiş bir classifier. Ama bugün insan etiketi yok: `LOG.md:80` yalnızca "250 aktif (+2 arşiv) · junk(arşivde):2" diyor; "BU" sayısı bu log satırında yok. Bu alternatif, etiket toplanmadan uygulanamaz.
- Marj/abstention: ikinci en iyi skor + margin saklanmalı; `pattern_observations` yalnızca `similarity` tutuyor (`db/schema.sql:59-66`), `margin`/`second_sim` yok. `calculate_probabilities=False` (`recluster.py:147`) ve `prediction_data=True` (`:132`) birlikte gözden geçirilmeli; olasılık/margin üretimi bu iki ayara bağlı.
- "Centroid'i bırak" tavsiyesi bu repo için **kanıtlanmış bir düzeltme değil**, bir A/B deneyidir. Çapraz denetimin kendi kabul kriteri de bunu söylüyor: "Atama yöntemi, centroid argmax taban çizgisini insan etiketli örneklemde geçmeli" (`capraz_denetim_metni.md:77`). Bu örneklem yok.

### 3. Türkçe desteği

**Kısa hüküm:** Türkçe **tespit** ediliyor, **işlenmiyor**. Şemada `language` var; `franc-min` `tur` dönebiliyor; ama Türkçe stopword, lemma/stem, Zemberek, ayrı embedding veya dil bazlı kümeleme yok. Çapraz denetimin `stop_words="english"` eleştirisi repo için **DOĞRU**; "Türkçe hattı" önerisi ise **KAYNAKTA YOK** (henüz yazılmamış).

- Şema: `language text` — `db/schema.sql:27`; index — `:37`.
- Tespit: `const SUPPORTED = new Set(["eng", "tur"]);` — `src/language.ts:6`; 20 karakterden kısa metinde `null` — `:10`; `eng/tur` dışı `null` — `:12`; `tur → "tr"` — `:13`.
- Yazım: `const language = o.language ?? detectLanguage(title, text);` — `src/db.ts:61`.
- Kümeleme: `CountVectorizer(stop_words="english", ngram_range=(1, 2), min_df=1)` — `cluster/recluster.py:138`. Türkçe stopword listesi, Zemberek, lemma/stem yok (grep: `.py` içinde `zemberek|lemma|stem` 0).
- Kümeleme girdisi dil filtresi yok: `fetch_embeddings` yalnızca `status` ve `embedding` bakıyor — `cluster/recluster.py:72-80`; `language` kullanılmıyor.
- TR araması: `counterpart.ts` SearXNG'ye `language=tr` ile gidiyor (`src/counterpart.ts:43`), ama observation'a `language: null` yazıyor (`src/counterpart.ts:107`); plan ise `language='tr'` diyor (`plan.md:429`). `upsertNormalized` null'u `detectLanguage` ile doldurabilir (`src/db.ts:61`), ama bu garanti değil; kısa snippet'lerde null kalabilir. Bu, plan-kod arasında somut bir uyumsuzluktur.
- Pilot TR içermiyor: `plan.md:255` "TR ve EN içerik embedding uzayında dile göre ayrışabilir → dil bazlı sahte cluster'lar"; `plan.md:529` "Dil ayrışması — GÜVENİLMEZ, ölçülmeden üretime geçilmez"; `LOG.md:259` "TR/EN centroid benzerliği GÜVENİLMEZ — pilot ana akışı TR içerik barındırmaz".
- TR/EN testi kapı: `AGENTS.md:31` "TR/EN split(FAZ14 öncesi 50 çift tests; geçilmeden TR adapter yazılmaz)"; `plan.md:576` "bu test geçilmeden FAZ 14 yazılmaz".

**Etki alanı:** `CountVectorizer` yalnızca c-TF-IDF keyword/temsil üretiminde kullanılıyor (`recluster.py:138-146`); küme üyeliği UMAP/HDBSCAN'ın embedding girdisinden geliyor. Yani Türkçe metin girerse **küme üyeliği** bozulmaz, ama **etiketler** "bir, bu, ve, için" ile kirlenir. Çapraz denetimin "c-TF-IDF etiketleri kirlenir" ifadesi doğru; "kümeleme bozulur" biçiminde okunursa fazla olur.

### 4. Run manifest, sürüm sabitleme, `random_state` logu, snapshot hash

**Kısa hüküm:** Hiçbiri tam olarak yok. Çapraz denetimin P0.2'si tamamen haklı.

- Manifest/`run_id` yok: grep `manifest|run_id` yalnızca `research_notes/` ve `reports/` içinde; kodda/şemada yok. `adapter_state` yalnızca imleç ve sayaç tutuyor (`db/schema.sql:105-111`); `patterns.created_at`, `pattern_observations.assigned_at`, `pattern_history.at` timestamp — hangi parametre setiyle üretildiğini söylemiyor.
- `random_state` kodda var (`recluster.py:39`, `125`) ama çalışma logunda yok. Recluster'ın tek özet satırı:
  ```python
  print(f"> {n} embedding — UMAP({UMAP_N_COMPONENTS}D) + HDBSCAN(min_cluster={HDBSCAN_MIN_CLUSTER_SIZE})")
  ```
  — `cluster/recluster.py:118`
  Bu satır `n_neighbors`, `min_samples`, `random_state`, `metric`, `min_dist`, `epsilon`, sürümleri yazmıyor.
- Sürüm pinleme yok:
  - `cluster/requirements.txt:4`: `bertopic>=0.16.4` (floor, pin değil).
  - `requirements.txt:4`: `sentence-transformers>=3.0,<6` (legacy).
  - `docker-compose.yml:30`: TEI imajı `86-1.8.2` pinli; `:32`: model `Qwen/Qwen3-Embedding-0.6B` etiketi pinli değil (revision/hash yok).
  - Python için lock/`pip freeze` dosyası yok; `Dockerfile` yalnızca legacy `main.py` için (`Dockerfile:13`).
  - `LOG.md:89` gerçek kurulumu kaydetmiş: "`bertopic 0.17.4 + sentence-transformers 6.1.0` kuruldu" — yani ortam, `>=0.16.4` floor'unun üstüne çıkmış; bu, manifestin neden gerekli olduğunun kanıtı.
  - Aktif TS hattı `package.json:7-17` script'leri (`collect`, `pipeline`, `review`, `counterpart`, `deepen`, `typecheck`); Python cluster bağımlılığı ayrı `cluster/requirements.txt`. `docker-compose.yml` yalnızca postgres/TEI/SearXNG servislerini tanımlıyor; cluster için compose servisi yok. Plan Python'u WSL2 + Docker ortamına, TS adapter'ları Windows tarafına koyuyor (`plan.md:601-609`).
- Snapshot hash yok: `observations.content_hash` kayıt başına FNV-1a (`src/db.ts:87-97`); `raw_observations`'ta hash yok (`db/schema.sql:7-14`); korpusun tamamı için snapshot hash yok.
- `NUMBA_NUM_THREADS` yok; UMAP `random_state` verildiğinde tek iş parçacığına zorlama eğilimi `LOG.md:76`'da "UMAP `random_state` uyarısı zararsız (tek-çekirdek dayatması)" diye not edilmiş. Bu, aynı makinede tekrarlanabilirliği destekler; farklı OS/Numba sürümlerinde garanti etmez.

**"Deterministik veri yolu" nerede iddia ediliyor?**

- `AGENTS.md:26`: "İlkeler: sistem kanıt sunar; filtre/skor/ağırlık YOK; LLM yalnız yorum katmanı; **veri yolu %100 deterministik**; scraper/proxy yok ..."
- `plan.md:540`: "**Sistem karar vermez, kanıt sunar.** Filtre, skor, ağırlık yok — bunlar sinyalleri sessizce kaybeder. İnsan denetimi tam listeyi görür; doğruluk kaybının tek kaynağı veri işleme hatalarıdır (dup, yanlış embed, bozuk normalize) ve **orada %100 deterministik gidilir**."
- `plan.md:269`: "Veri yolunda asla: observation silme/değiştirme, cluster üyeliği, signal_types, pattern merge — **hepsi deterministik**."
- `plan.md:673`: "**LLM sınırı:** yalnızca yorum katmanı; **veri yolunda determinizm zorunlu**."

**Ama repo kendi içinde çelişiyor:**

- `plan.md:369`: "İki modlu strateji (**HDBSCAN deterministik değildir**; her yeni veride tam reclustering pattern ID'lerini kaydırır)" — bu, yanlış bileşeni işaret ediyor. HDBSCAN rastgele başlangıç kullanmaz; transdüktiftir (yeni veriyle etiketler değişir). Stokastik olan UMAP'tir. Bu, çapraz denetimin "deterministik" eleştirisini destekler; ama çapraz denetim de bu satırı düzeltmiyor.
- `plan.md:541`: "**plan.md sözleşme değil, başlangıç hipotezidir.**" — yani "deterministik" iddiası bir garanti değil, hedef.
- `LOG.md:93`: "deterministik tekrar OK" — sentetik test; gerçek korpusta iki koşu karşılaştırması yok.

**Doğru ifade:** Observation düzeyinde (normalize/clean/embed) determinizm büyük ölçüde mümkün; küme kimliği ve pattern ID seti için doğru hedef "pinned ortamda replayable". Bunun için manifest şart: `run_id`, kod SHA, embedding model + revision, TEI imaj digest, Python/BERTopic/UMAP/HDBSCAN/Numba/NumPy/sklearn sürümleri, tüm parametreler, `NUMBA_NUM_THREADS`, korpus satır sayısı + snapshot hash, `random_state`, git dirty flag.

### 5. Veri ölçeği ve şema

**Kaynak ölçeği:**

- 10 subreddit: `src/config.ts:24-35`.
- `BACKFILL_SINCE` = son 18 takvim ayı: `src/config.ts:37-43`; `AGENTS.md:34`; `plan.md:555`.
- Pilot hedefi ~50k obs: `plan.md:554` ("~50k obs: config'teki 10 subreddit + HN").
- Gerçek pilot: ham ~50.7k; clean 39.453; discard 604 (%1.5); recluster 54.579 obs; 252 pattern; noise %44 — `LOG.md:26-29`.
- Kapsam sapması: "SaaS 50.3k + HN 5.2k" — `LOG.md:27`. Yani pilot 10 sub'a yayılmadı; tek-sub ağırlıklı. Bu, çapraz denetimin "büyük, heterojen UGC" varsayımını bu korpus için geçersiz kılar.
- En büyük pattern'lar: cold-email 1024, video/UGC 929, SEO 877, validation 635, stripe 551, cofounder 540 — `LOG.md:30`. 54k ölçeğinde mega-cluster'lar hâlâ var.

**Şema:**

| Tablo | Satır | Not |
|---|---|---|
| `raw_observations` | `db/schema.sql:7-14` | JSONB, immutable; `unique (source, source_id)` |
| `observations` | `:17-34` | normalize + clean + embed; `language`, `metadata`, `signal_types`, `content_hash`, `status`, `embedding` |
| `patterns` | `:42-55` | `centroid halfvec(1024)`, `keywords`, `status`, `review_status` |
| `pattern_observations` | `:59-66` | `similarity`, `run_kind` (`centroid`/`recluster`) |
| `pattern_history` | `:72-78` | `overlap_ratio` |
| `metric_snapshots` | `:81-89` | pilot sonrası |
| `counterpart_searches` | `:92-101` | TR arama idempotentliği |
| `adapter_state` | `:105-111` | imleç + sayaç |

Toplam **8 tablo + 2 view** (`v_pattern_sources` `:114-120`, `v_pattern_frequency` `:123-143`). `LOG.md:297` "5 tablo" diyor ama altı isim sayıyor; `pattern_history` ve `adapter_state` eksik — **ESKİMİŞ** log satırı.

**Embedding boyutları:**

- `observations.embedding halfvec(1024)` — `db/schema.sql:32`.
- `patterns.centroid halfvec(1024)` — `db/schema.sql:46`.
- Legacy: `embedding.py:19` `ALTER TABLE raw_items ADD COLUMN IF NOT EXISTS embedding vector(384);`; `config.py:16` `EMBEDDING_MODEL = ... "all-MiniLM-L6-v2"`. Bu, aktif hat değil; `raw_items` tablosu `db/schema.sql`'de yok. **ESKİMİŞ/legacy**.

**Durum değerleri:**

- `patterns.status`: `active | merged | archived` — `db/schema.sql:51`; `AGENTS.md:27`.
- `patterns.review_status`: `unreviewed | seen | interesting | junk` — `db/schema.sql:52`; `AGENTS.md:27`.
- `observations.status`: kodda `new`, `cleaned`, `embedded`, `embedded_noise`, `discarded` — `db/schema.sql:31` (comment yok), `cluster/recluster.py:76`, `180`, `cluster/assign.py:66`, `src/pipeline/clean.ts:58`, `65`, `src/pipeline/embed.ts:84`. `plan.md:485` hâlâ `new|cleaned|embedded|classified|discarded` diyor; `embedded_noise` ve `classified` uyumsuz — **ESKİMİŞ** plan satırı.
- Hiçbirinde `CHECK` constraint yok; değerler yalnızca konvansiyon. Bu, `review_status`'a yanlış yazımı DB düzeyinde engellemez.
- Çapraz denetim "`review_status = interesting/approved`" diyor; repo'da `approved` değeri yok. Onaylı = `interesting` (`plan.md:360`). Terminoloji düzeltmesi.

**mcs / min_topic_size / TopicGPT ölçek hesabı:**

- 54.579 obs; %44 noise → ~30.564 atanmış; 252 pattern → ortalama ~121 obs/pattern.
- `mcs=25` = %0,046; `mcs=15` = %0,027; `mcs=60` = %0,11.
- `min_topic_size=100` = %0,18; `500` = %0,92. Bu, ortalama pattern boyutunun 100'ün üstünde olduğu anlamına gelir; 500 ise ortalamanın 4 katı. Pratikte 100–500, "yalnızca büyük kümeler" üretir; nadir sinyal avı için ters yönde bir reçetedir. (Çıkarım; 3060 grid'i gerekir.)
- TopicGPT "1–2K docs" = 50k'nın %2–4'ü. Bu, farklı bir çalışma noktası; 1–2K'yı 50k'dan **seçmek** filtre/sıralama olur. Eğer seçim insan tarafından "yüksek değerli" diye yapılırsa, bu artık otomatik pipeline değil, insan destekli alt-küme incelemesidir.

`TOPLAMA-KAPASITE-TAHMINI.md` bu ölçeğin kaynağı değil; Firecrawl/Apify ücretsiz plan kapasitesiyle ilgili. Observation sayısı tahmini için kullanılmamalı.

### 6. Lisans / retention alanları şemada var mı?

**Kısa hüküm:** Hayır. `license_id`, `ai_use_allowed`, `attribution_required`, `retention_policy`, `deletion_request_supported`, `source_snapshot_hash` alanlarının hiçbiri first-class değil. `metadata jsonb` ve `raw_data jsonb` bir escape hatch sunar; ama constraint, index, join, audit ve source-policy yok.

**Mevcut olanlar:**

- `observations.metadata jsonb not null default '{}'` — `db/schema.sql:28`; `deep_dive_for`, `parent_pattern_id`, `subreddit` gibi anahtarlar burada (`src/deepen.ts:144`, `src/counterpart.ts:108`, `src/adapters/reddit-backfill.ts:114-123`).
- `raw_observations.raw_data jsonb` — `db/schema.sql:11`.
- `observations.source_url text not null unique` — `:21`.
- `observations.content_hash` — `:30`; FNV-1a, kayıt başına — `src/db.ts:87-97`.
- `source_snapshot_hash` yok; `raw_observations`'ta hash yok.
- `deletion_request_supported` yok; genel silme akışı yok. `deepen prune` yalnızca `metadata ? 'deep_dive_for'` olanları siliyor (`src/deepen.ts:188-190`); bu, silme talebi akışı değil.
- `raw_observations` "immutable" — `db/schema.sql:6` `-- FAZ 3: ham veri, immutable`; `plan.md:150` "Ham veri değiştirilmez; sonradan yeniden işlenebilir." Bu, silme talebiyle doğrudan gerilimlidir. Silme için tombstone/erasure istisnası veya hash-only saklama kararı gerekir.

**Doğru normalizasyon:**

| Alan | Nerede olmalı | Neden |
|---|---|---|
| `license_id` | `sources` tablosu (source-level) + `observations.license_id` FK | Kaynak lisansı kaynak başına; kayıt başına kopyalamak denormalize |
| `ai_use_allowed` | `sources` | Politika kaynak başına |
| `attribution_required` | `sources` | Politika kaynak başına |
| `retention_policy` | `sources` + deletion job | Politika kaynak başına |
| `deletion_request_supported` | `sources` + `deletion_requests` tablosu | Politika + talep audit'i |
| `source_snapshot_hash` | `ingest_runs` tablosu + `raw_observations.snapshot_hash` | Snapshot run başına; kayıt başına değil |

**Gereken değişiklik (kod yazılmadan):** yeni `sources` ve `ingest_runs` tabloları; `observations`/`raw_observations`'a `license_id`/`snapshot_hash` kolonları; `deletion_requests` tablosu; `raw_observations` immutable kuralına silme istisnası; adapter'ların bu alanları doldurması; mevcut 50k+ satır için backfill; review/UI'da lisans rozeti. Bunların bir kısmı bu makinede yazılabilir; uygulama/DB doğrulaması 3060'ta.

### 7. "Filtre/skor/ağırlık yok" ilkesi ile çapraz denetim önerileri çelişiyor mu?

**İlke (birebir):**

- `plan.md:540`: "**Sistem karar vermez, kanıt sunar.** Filtre, skor, ağırlık yok — bunlar sinyalleri sessizce kaybeder. İnsan denetimi tam listeyi görür; doğruluk kaybının tek kaynağı veri işleme hatalarıdır (dup, yanlış embed, bozuk normalize) ve orada %100 deterministik gidilir."
- `plan.md:268`: "**Sistem karar vermez, kanıt sunar.** Filtre yok, skor yok, ağırlık yok. Signal_types, kaynak sayısı, frekans eğimi, recency, metrik delta, TR karşılığı → pattern kartında **gösterilen kanıttır**; eleme araçları değil. İnsan denetimi tüm pattern listesini görür, karar insandadır."
- `plan.md:359`: "Sistem kanıt sunar, karar vermez — UI'da filtre/skor yok; tüm pattern'lar listelenir, nötr sıralama (observation_count / kronolojik). Kanıt alanları kartta bilgi olarak durur; eleme aracı değildir."
- `AGENTS.md:26`: "... filtre/skor/ağırlık YOK ..."

**Değerlendirme:**

| Çapraz denetim önerisi | İlkeyle uyum | Koşul |
|---|---|---|
| Sinyal hiyerarşisi (para > pilot > workaround > sayı > genel şikâyet > "I wish") | **Uyumlu** | `signal_types`/kanıt etiketi olarak gösterilirse. `plan.md:285` observation bazında `text[]`, `:268` "gösterilen kanıt" diyor. |
| Aynı hiyerarşiyi skor/sıralama olarak kullanmak | **Çelişir** | `plan.md:540` ve `:359` skor/sıralama/elemeyi yasaklıyor. |
| Stabilite kriteri (2 komşu parametrede stabil) | **KISMEN** | Pattern'e rozet/uyarı olarak eklenirse uyumlu; "stabil değilse gösterme" olursa `plan.md:359` ile çelişir. |
| Kalibre edilmiş atama eşiği | **Uyumlu** | Mevcut 0.55 zaten açık ölçüm (`AGENTS.md:31`); düşen obs silinmiyor, recluster'a kalıyor (`cluster/assign.py:3-4`). |
| Kalibre edilmiş eşikle pattern eleme | **Çelişir** | Bu bir filtre; `plan.md:540`. |
| LLM jüri (yalnızca belirsiz kümelerde) | **KISMEN** | Sadece kanıt/kuyruk üretirse uyumlu; `review_status` yazmazsa ve pattern gizlemezse. Üyelik/merge/öncelik kararı verirse `plan.md:269`/`:544` ihlali. |
| Burst'ü tetik olarak kullanmak | **Uyumlu** | `plan.md:377-380` recluster tetiğini zaten böyle tanımlıyor; burst skoru kayda yazılmazsa. Ama burst kodu yok. |
| Ask planı / ICP / fiyat | **Uyumlu (pipeline dışı)** | Veri yoluna dokunmuyor; ürün/GTM katmanı. |

**Sonuç:** Çapraz denetim ilkeye **tamamen yabancı değil**; "LLM asla review_status yazmamalı" ve "kanıt" vurgusu repo ilkesiyle aynı. Çelişki, hiyerarşinin **skor/sıralama** olarak kullanılması, stabilite kriterinin **eleme** kapısına dönüşmesi ve LLM jürisinin **üyelik/öncelik** kararı vermesidir. Doğru uygulama: bu sinyalleri pattern kartında **kanıt/rozet** olarak göstermek, pattern listesini kısaltmamak; eşikleri yalnızca atama/kuyruk için kullanmak, kayıt silmemek.

Not: Repo'da zaten bir eşik (0.55) ve bir tetik (%5 atanmamış oranı, `src/orchestrator.ts:15`) var. İlke "hiç eşik yok" demiyor; "eşik kanıtı sessizce elemesin" diyor. Bu ayrım, çapraz denetimin önerilerini değerlendirirken korunmalı.

### 8. Bu makine vs 3060: P0–P2 uygulanabilirlik

**Ortam (birebir):**

- `AGENTS.md:4`: "Bu cihaz: HUAWEI laptop (Ryzen 5, 8GB, **GPU yok, WSL2/Docker yok**) — runtime doğrulama YAPILAMAZ (DB/embed/cluster testleri 3060 PC'de)."
- `AGENTS.md:5`: "Bu cihazda yapılabilecek: kod yazımı, `pnpm typecheck`, dry-run eden adapter'lar (BD'siz mod), offline işler."
- `AGENTS.md:6`: "Docker gerektiren her şey (postgres/pgvector, TEI, SearXNG, BERTopic) 3060 PC'de koşar — orada test edilmedikçe 'çalışıyor' SAYILMAZ; kod + LOG'a '3060'a bekleme' işareti."

**Etiketler:** `[KOD]` bu makinede yazılabilir; `[3060]` runtime doğrulaması 3060'ta; `[VERİ]` veri/etiket gerekir; `[HUKUK]` dış karar; `[DENEY]` yerleşik değil, deney gerekir; `[KAPI]` plan/AGENTS'teki ön koşul; `[İLKE]` plan ilkesiyle uyum; `[ÜRÜN]` ürün/GTM kararı.

#### P0 — Ölçüm sözleşmesi

1. **"Deterministik" → "replayable"** — `[KOD]` doküman değişikliği; runtime yok. Etkilenen: `AGENTS.md:26`, `plan.md:269`, `plan.md:540`, `plan.md:673`; ayrıca `plan.md:369`'daki HDBSCAN atfı düzeltilmeli. `[DENEY]` yok.
2. **Run manifest** — `[KOD]` şema/`run_id`/logger yazılabilir; `[3060]` iki koşu + hash karşılaştırması; `[VERİ]` gerçek korpus; `[DENEY]` "aynı manifest + aynı ortam = aynı pattern ID seti" **kanıtlanmadı**. Ayrıca `pip freeze`/lock 3060'ta alınmalı; `cluster/requirements.txt:4` floor'u pin'e çevrilmeli.
3. **0.55'i evrensel olmaktan çıkar; TR/EN ayrı kalibrasyon** — `[KOD]` eşiği env/config'e taşıma ve kalibrasyon harness'i burada yazılabilir; `[3060]` embedding + benzerlik ölçümü; `[VERİ]` ~50 elle seçilmiş TR/EN çift (seçim burada yapılabilir, embedding 3060'ta); `[DENEY]` eşik değeri bilinmiyor. Not: TR korpusu henüz yok; `counterpart` yalnızca onaylı pattern'larda çalışıyor (`plan.md:391`, `416`).
4. **Centroid → `BERTopic.transform` / kalibre sınıflandırıcı** — `[KOD]` model persist + transform yolu yazılabilir; `[3060]` head-to-head deney; `[VERİ]` insan etiketli örneklem yok (`LOG.md:80`: 2 junk, BU sayısı bu log satırında yok); `[DENEY]` centroid'den daha iyi olduğu kanıtsız. Sınıflandırıcı için etiket yok; önce etiket toplanmalı.
5. **LLM'in `review_status` yazmasını engelle** — `[KOD]` bugün zaten yok; yapısal guard için `CHECK (review_status IN (...))` + ayrı DB role/read-only LLM kullanıcısı eklenebilir. `[3060]` migration uygulaması. `[DENEY]` yok. Not: repoda LLM kodu hiç yok; `src/review.ts:168-177` tek yazar.

#### P1 — Keşif ve Türkçe

1. **`mcs=5 + eps≈0 + leaf` reçetesini bırak; grid dene** — Repo zaten `mcs=25/eom`; `[KOD]` parametreleri env/CLI'a açmak burada; `[3060]` 15–60 × eps 0.05–0.30 × eom/leaf grid; `[DENEY]` hangi kombinasyonun daha iyi olduğu bilinmiyor. `[VERİ]` 54.6k korpus. Not: asıl gözlem %44 noise ve mega-cluster; mikro-küme değil.
2. **Kısa metinleri thread/user/observation bazında havuzla** — `[KOD]` HN için `parent_story_id` var (`src/adapters/hackernews.ts:96`); Reddit'te yalnızca `crosspost_parent_id` var (`src/adapters/reddit-backfill.ts:122`), yorum parent'ı yok; user bazlı havuzlama için adapter/şema değişikliği gerekir. `[VERİ]` gerçek dağılım; `[3060]` etki ölçümü. Bu, "observation = tek metin kaydı" birimini (`plan.md:209`) değiştirebilir; dikkatli tasarım gerekir.
3. **Türkçe için ayrı stopword/lemma/stem/embedding/eşik** — `[KOD]` Türkçe stopword listesi ve Zemberek entegrasyonu yazılabilir; Zemberek Java bağımlılığı nedeniyle ortam kurulumu 3060'ta daha güvenli. `[3060]` etiket kalitesi ve eşik kalibrasyonu; `[VERİ]` TR korpusu yok; `[KAPI]` `AGENTS.md:31`/`plan.md:576`: 50 çift testi geçilmeden TR adapter yazılmaz. Yani P1.3, P0.3'e bağımlı.
4. **Burst için BH-FDR, min count, exact/smoothing, null simülasyonu** — `[KOD]` saf istatistik modülü burada yazılabilir; `[VERİ]` zaman serisi; `[3060]` null simülasyon/FDR doğrulaması. Repo'da burst kanalı **hiç yok**; bu greenfield bir özellik, "düzeltme" değil.
5. **Her pattern için iki komşu parametrede stabilite şartı** — `[KOD]` harness yazılabilir; `[3060]` çoklu koşu; `[DENEY]` kriterin tanımı ve eşiği yok. `LOG.md:36-38` zaten ARI 0.703 (seed) / 0.521 (%80 alt-örneklem) gösteriyor; "stabilite" kolay bir kapı değil. `[İLKE]` Eleme aracı olursa `plan.md:359` ile çelişir.

#### P2 — Kanıt, hukuk ve ask

1. **Her sinyali "hipotez" etiketle; permalink, verbatim, bağımsız kaynak sayısı, model/prompt sürümü sakla** — `[KOD]` kaynak URL/verbatim zaten `observations.source_url` + `text` (`db/schema.sql:21-23`); ayrı `hypotheses` tablosu yok. `[KOD]` şema/UI yazılabilir; `[3060]` runtime. Model/prompt sürümü bugün yok çünkü LLM yok; eklendiğinde manifest alanı olmalı.
2. **Workaround/para/sayı/tekrar testlerini "kanıt türü" olarak göster** — `[KOD]` UI/etiket işi; `signal_types` altyapısı var (`db/schema.sql:29`) ama doldurma pilot sonrası (`plan.md:283`). `[3060]` görüntüleme. Skor olarak sunulmamalı (`plan.md:268`).
3. **Her yüksek skorlu hipotez için ask planı** — `[ÜRÜN]` doküman/GTM; repo'da kod yok. Pipeline dışı; `[3060]` gerekmez.
4. **Lisans metadata'sını first-class yap** — `[KOD]` migration yazılabilir; `[HUKUK]` lisans/retention politikası dış karar; `[3060]` DB uygulama + backfill. Bkz. §6.
5. **Reddit için Mart 2027 kararı; ekşi'yi LLM hattından çıkar** — `[HUKUK]`/`[ÜRÜN]` karar; `[KOD]` ekşi adapter'ı zaten yok (grep: yok), yani "çıkarma" değil "eklememe" kararı. Reddit Arctic Shift'te (`plan.md:62`); lisans kararı kodla çözülmez.
6. **Ürünü "kanıtlı hipotez → ölçülebilir doğrulama deneyi" olarak konumlandır** — `[ÜRÜN]` doküman; runtime yok.

**Kod-only vs 3060 özeti:**

| İş | Bu makinede yazılır | 3060'ta doğrulanır |
|---|---|---|
| "Deterministik" → "replayable" dokümanı | Evet | Hayır |
| Manifest şeması + logger | Evet | İki koşu + hash |
| 0.55'i config'e taşıma + kalibrasyon harness'i | Evet | Embedding + benzerlik |
| Model persist + `transform` yolu | Evet | Head-to-head deney |
| DB `CHECK`/rol sertleştirmesi | Evet | Migration |
| Parametreleri env/CLI'a açma | Evet | Grid koşuları |
| Thread/user havuzlama | Kısmen (HN) | Etki ölçümü |
| Türkçe stopword/Zemberek | Evet (ortam 3060) | Etiket kalitesi |
| BH-FDR / burst istatistiği | Evet | Null simülasyon |
| Stabilite harness'i | Evet | Çoklu koşu |
| Hipotez/kanıt şeması + UI | Evet | Runtime |
| Lisans/retention şeması | Evet | Migration + backfill; hukuk dış karar |
| Reddit/ekşi/pozisyonlama | Hayır (politika) | Hayır |

### 9. Mevcut notlar: 0.55, centroid, TR/EN ve geçmiş kümeleme arızaları

**0.55 ile ilgili mevcut kayıtlar:**

- `cluster/assign.py:7`: `# Eşik: 0.55 — pilot veriyle kalibre edilecek (TR/EN çift testi sonrası).`
- `AGENTS.md:31`: "Açık ölçümler (pilot sonrası kapanır): recluster eşiği, assign eşik(0.55), outlier oranı, TR/EN split(FAZ14 öncesi 50 çift tests; geçilmeden TR adapter yazılmaz)."
- `LOG.md:422`: "- Atanmamış yeni `embedded`'ları mevcut aktif centroid'lere cosine ile atar (eşik 0.55 — pilot ile kalibre edilecek)"
- `LOG.md:94`: "- Assign eşiği 0.55: grup-içi held-out ~0.97 (atanır), rastgele noise ~0.0-0.13 (atanmaz) — eşik gerçek veride anlamlı"
- `LOG.md:99`: "- assign (8 yeni: 5 export-benzeri + 3 alakasız): **5/8 atandı, tamamı pattern 1'e sim 0.71-0.83**; 3 alakasız boşta — seed edilmiş uçtan uca testte eşik bu örneklerde beklendiği gibi çalıştı"

**Yorum:** 0.55'in tek gerçek testi sentetik (3 grup × 100) ve 8 örnekli seed verisi (`LOG.md:93-99`). Gerçek pilot korpusunda insan etiketli kalibrasyon yok. Çapraz denetimin "0.55 kalibre değil" tespiti doğru; ama repo bunu zaten "pilot ile kalibre edilecek" diye işaretlemiş. Yeni olan şey, çapraz denetimin bunu P0'a taşıması.

**Centroid güvenilirliği / geçmiş kümeleme arızaları:**

- `LOG.md:29`: "- Recluster (54.579 obs): **252 pattern**, noise %44 (15k'da %47'ydi — ölçekle hafif iyileşme, eşik üstü; otopsi hükmü geçerli)." — Planın outlier eşiği %40 (`plan.md:533`); pilot bunun üstünde.
- `LOG.md:30`: "- En büyükler tutarlı: cold-email 1024, video/UGC 929, SEO 877, validation 635, stripe 551, cofounder 540. history=109 (eski hepsi eşleşti)." — 54k'da hâlâ 1024 üyelik mega-cluster var.
- `LOG.md:36-38`: "- seed0 vs seed1 ARI=0.703 (SAĞLAM): 101/107 cluster, noise %48/%47 — üretim seed'i (42→109 cluster) artefakt üretmiyor. / - %80 alt-örneklem ARI=0.521 (orta): küçük cluster'lar eriyor — density yöntemin doğası; 50k'da artması beklenir. / - Hüküm: pattern'lar review'e girebilir; kör parametre oynaması YOK (otopsiyle tutarlı — noise seyrekliği yapısal). Noise kalibrasyonu veri büyüyünce yeniden ölçülür."
- `LOG.md:74-76`: "- Clustering (recluster.py parametreleriyle bellek-içi, yazmasız): 2 cluster + noise %4 (Açık Soru 7 eşiği %40'ın çok altı ✓) ... - Not: 444 üyelik mega-cluster bu ölçekte normal (veri homojen SaaS; min_cluster 25); pilot ölçeğinde bölünür. UMAP `random_state` uyarısı zararsız (tek-çekirdek dayatması)"
- `LOG.md:27`: "- KAPSAM SAPMASI: corpus tek-sub ağırlıklı (SaaS 50.3k + HN 5.2k) — adapter oturum-limiti ilk sub tükenmeden sonrakine geçmiyor. Geçerli ölçek testi ama plan 10 sub diyordu; sub-dönüşü (round-robin) sonraki PR'a."
- `LOG.md:39`: "- Not: prob ilk seferde status filtresini dar tutmuş (7.933/15.126) — recluster.py'nin `embedded_noise`'u da kattığı fark edilip düzeltildi." — Geçmişte kümeleme girdisi eksik alınmış; düzeltilmiş.

**Yorum:** Repo'nun kendi ampirik tablosu, çapraz denetimin genel HDBSCAN dokümantasyonundan çıkardığı sonuçlardan daha zengin: asıl sorun mikro-küme değil, **%44 noise**, **mega-cluster**, **tek-sub skew** ve **%80 alt-örneklemde ARI 0.521**. Çapraz denetim bu dört bulguyu hiç kullanmıyor; `mcs=5` eleştirisini repo'ya yöneltiyor ki repo zaten 25 kullanıyor. Bu, çapraz denetimin en büyük bağlam hatası.

**TR/EN ile ilgili mevcut kayıtlar:**

- `LOG.md:259`: "- **TR/EN centroid benzerliği GÜVENİLMEZ** — pilot ana akışı TR içerik barındırmaz (Reddit/HN ~tam EN); ölçüm pilot'tan çıkamaz"
- `LOG.md:260`: "- **Ayrı mini test FAZ 14 ÖNCESİ koşulur:** ~50 elle seçilmiş TR/EN çift → Qwen3 benzerlik ölçümü (~1 saat). Hipotez doğrulama değil, zorunlu ölçüm — MTEB skoru kanıt değildir (benchmark ≠ bizim corpus)"
- `LOG.md:261`: "- FAZ 14 (TR karşılık araması) bu test geçilmeden yazılmaz; eşik altı → yedek embedding modeli değerlendirilir (Gemini/Cohere)"
- `plan.md:215`: "**TR/EN doğrulama — zamanlaması v3.2'de netleşti:** bu test pilot ana akışından ÇIKARILDI (pilot verisi TR barındırmaz, ölçülemez). **Ayrı mini test: pilot'tan SONRA, FAZ 14'ten ÖNCE** koşulur — prosedür: ~50 elle seçilmiş çift (aynı şikâyetin iki dilde ifade edilişi) → Qwen3 TR↔EN centroid benzerlik ölçümü. Zorunlu ölçüm; eşik altı → yedek modeller (bkz. Açık Soru 3)."
- `plan.md:529`: "**Dil ayrışması — GÜVENİLMEZ, ölçülmeden üretime geçilmez (v3.2 netleşme):** Pilot ana akışı TR içerik barındırmaz (Reddit/HN ~tam EN); bu sorunun cevabı pilot probe'undan ÇIKMAZ."

**Yorum:** Çapraz denetim 0.55'in TR'ye taşınmasını eleştirirken haklı; repo'nun kendi notu da aynı şeyi söylüyor (`LOG.md:259`, `plan.md:215`). Ancak çapraz denetim, bu notların varlığını kabul etmiyor; sanki repo 0.55'i evrensel doğru kabul ediyormuş gibi çerçeveliyor. Doğru çerçeve: "repo 0.55'i geçici sabit olarak kullanıyor ve kalibrasyonu pilot sonrasına bırakmış; çapraz denetim bu borcun P0 olduğunu söylüyor."

---

## Deney gerektiren "yerleşik" iddialar

Çapraz denetim bazı önerileri kesin düzeltme gibi sunuyor; oysa bunlar bu repo'da **deney** gerektirir:

1. **"Centroid ataması yanlış; `transform` doğru."** Repo'nun centroid'i açık mean; `transform` UMAP uzayında çalışır. Hangisinin insan etiketli örneklemde daha iyi olduğu ölçülmedi. Çapraz denetimin kendi kabul kriteri (`:77`) de bunu şart koşuyor.
2. **"`mcs=15–60` grid."** 25 zaten aralıkta. Hangi değerin %44 noise'u ve mega-cluster'ı azalttığı bilinmiyor; 3060'ta grid gerekir.
3. **"`cluster_selection_epsilon=0.05–0.30`."** Repo'da epsilon hiç ayarlanmamış (0.0). Bu aralığın 54k'da ne yapacağı denenmedi.
4. **"`min_topic_size=100–500`."** Özel HDBSCAN varken BERTopic parametresi devrede değil; `mcs`'ye çevrilirse 50k'da çok kaba olabilir. BERTopic'in 100–500 tavsiyesi büyük korpuslar içindir; 50k pilot için doğrulanmadı.
5. **"Aynı manifest + aynı ortam = aynı pattern ID seti."** İki koşu karşılaştırması yapılmadı; UMAP/Numba sürüm ve thread etkisi açık. Bu bir kabul kriteri, kanıt değil.
6. **"İki komşu parametre setinde stabilite."** Kriterin tanımı (hangi metrik, hangi eşik, hangi pattern eşleşmesi) yok. `LOG.md:36-38` ARI 0.521'i gösteriyor; stabilite kolay değil.
7. **"LLM jüri."** Repo'da LLM yok; kalite/maliyet/gizlilik ölçülmedi. Ayrıca jüri "öncelik" verirse filtre ilkesiyle çelişir.
8. **"TopicGPT 1–2K docs."** 50k'dan 1–2K seçmek filtre/sıralama; hangi 1–2K'nın seçileceği tanımsız. Farklı ölçek rejimi.
9. **"0.55 yerine kalibre eşik."** Hangi eşiğin doğru olduğu TR/EN çift testi ve insan etiketli örneklem olmadan bilinmiyor; "kalibre et" bir süreç, sonuç değil.
10. **"BERTopic `transform` + `approximate_predict`."** Model persist edilmediği için bugün çalışmaz; önce model artifact'i eklenmeli, sonra transform'un centroid'e göre daha iyi olduğu gösterilmeli.

Ayrıca çapraz denetimin "mevcut kod UMAP(15,10,cosine,42)+HDBSCAN(25,10,eom)" cümlesi repo için doğru; ama bu cümle çapraz denetim metninde değil, önceki denetim notlarında. Çapraz denetim metni yalnızca aynı UMAP değerlerini **öneri** olarak veriyor (`capraz_denetim_metni.md:59`) ve HDBSCAN için 15–60 grid öneriyor. Yani "mevcut kod" iddiası ile "öneri" karışmış durumda; bu, denetimin kaynak disiplinini zayıflatıyor.

---

## Sonuç (kısa)

1. **Stack uyumu:** Çapraz denetimin BERTopic varsayımı yanlış değil; repo BERTopic kullanıyor. Ama günlük atama BERTopic değil, saf numpy centroid. `transform` önerisi bu yüzden "BERTopic'e geç" değil, "BERTopic modelini persist et ve günlük atamada kullan" anlamına gelir.
2. **Parametreler:** UMAP(15,10,cosine,42) + HDBSCAN(25,10,eom,eps=0) doğru. Çapraz denetimin `mcs=5+leaf` eleştirisi repo'ya değil, orijinal rapora ait. `min_topic_size` bu kodda devrede değil.
3. **0.55:** Kodda sabit, config'te değil; cosine. Repo zaten "pilotla kalibre edilecek" diyor. Gerçek pilot kalibrasyonu yok; sentetik test var.
4. **Türkçe:** Tespit var, işleme yok. `stop_words="english"` gerçek bir kusur; ama etkisi c-TF-IDF etiketleriyle sınırlı. TR/EN testi kapı; TR adapter yok.
5. **Determinizm/manifest:** "Deterministik" etiketi fazla geniş; doğru terim replayable. Manifest, sürüm pinleme, run_id ve snapshot hash yok — çapraz denetimin P0.2'si tamamen haklı.
6. **Ölçek:** 10 sub, 18 ay, ~50k hedef; gerçekte 54.579 obs, 252 pattern, %44 noise, tek-sub skew. `mcs=15–60` makul bir grid; `min_topic_size=100–500` bu ölçekte ters yönde. TopicGPT 1–2K farklı rejim.
7. **Şema:** Lisans/retention alanları yok; JSONB escape hatch var. `raw_observations` immutable, silme talebiyle çelişir. `source_snapshot_hash` yok; yalnızca per-record FNV-1a `content_hash` var.
8. **İlke:** Sinyal hiyerarşisi **etiket** olarak uyumlu, **skor/sıralama** olarak çelişir. Stabilite/LLM jüri, eleme/öncelik kararı verirse filtre olur. LLM'in `review_status` yazmaması zaten sağlanmış; DB constraint/rol ile sertleştirilebilir.
9. **Uygulanabilirlik:** Doküman, şema taslağı, parametre açma, stopword listesi, BH-FDR saf fonksiyonları, review UI alanları bu makinede yazılabilir; DB/embed/UMAP/HDBSCAN/grid/iki-koşu/TR-EN ölçümü/transform karşılaştırması 3060'ta. Çapraz denetimin "yerleşik" sunduğu 10 başlık aslında deney gerektiriyor.





