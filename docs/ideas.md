# Fikir sıralaması (M4)

1. Gürültü filtresi: adı "Anonymous startup" / "stealth" / "agency" olanlar, HN esprisi kalıpları ("Steal my ..."), ikiden az sayısal veri noktası olanlar (kart başına en az 2 gözlem şartı) ve yalnız Apple ilk-20 listesinden gelen dev uygulamalar elenir.
2. Kaynak + gelir + ürünlük puanı: her ek kaynak +3; TrustMRR gelir kanıtı varsa +3; ürünün kendi URL'si varsa +0.5, yoksa −0.5; açıklaması varsa +0.5; başlık 5 kelimeden uzunsa −0.5.
3. Sinyal puanı: HN puanı (log300, tek kaynaklıysa yarılanır) ve yorumları, Reddit skor/yorum, MRR (log10000), 30g MRR büyüme, PH feed sırası, Apple sırası; `logN = log10(1+değer)/log10(1+N)`, negatifler 0 sayılır.
4. İvme puanı: aynı günlük snapshot'ta aynı metriğin değişimi; sıra düşüşü +0.5, diğer artışlar log oranıyla (en fazla 1).
5. Toplam = kaynak + gelir + ürünlük + sinyal + ivme; gelir kanıtlı adaylardan en az 8'i ayrılıp kalanlarla birleştirilir, sonra puana göre ilk 15 seçilir; eşitlikte kaynak sayısı ve kısa ada göre sıralanır.

TR kartları: Show HN başlıklarından kısa ürün adı çıkarılır (Show HN:, tire/iki nokta/parantez öncesi); TR sorgusu yalnızca kısa ad ve en fazla iki anahtar kelimeden oluşur, uzun başlık asla sorgu değildir. Play arama HTML'sinde rating varsa okunur, yoksa detay sayfası denenir; ikisi de yoksa rating bilinmiyor kalır ve hüküm `uncertain` olur. Web SaaS için ücretsiz TR web araması denendi (Bing 200 ama "AI" → sohbet botları, "yapay zeka" → ChatGPT; Mojeek boş sonuç; Brave 429; DDG 202); güvenilir eşleşme olmadığı için web SaaS kartları belirsiz kalır, yanlış "dolu" hükmü verilmez.
