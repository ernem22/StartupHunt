# Fikir sıralaması (M4)

1. Gürültü filtresi: adı "Anonymous startup" vb. olanlar, sayısal veri noktası olmayanlar ve yalnız Apple ilk-20 listesinden gelen dev uygulamalar elenir.
2. Kaynak puanı: her ek kaynak +3 (tek kaynak 0, üç kaynak 6); aynı ürünün birden fazla kaynakta görünmesi en güçlü sinyal.
3. Sinyal puanı: HN puanı (log300, en fazla 1.5), HN yorum (log100 × 0.5), Reddit skor (log100), Reddit yorum (log50 × 0.5), MRR (log10000, en fazla 1.5), 30g MRR büyüme (yüzde/100, en fazla 1), PH feed sırası (1 − sıra/50), Apple sırası ((1 − sıra/100) × 0.5). `logN = log10(1+değer)/log10(1+N)`, negatif değerler 0 sayılır.
4. İvme puanı: aynı günlük snapshot'ta (data/YYYY-MM-DD.json) aynı metriğin değişimi; sıra düşüşü her metrik için +0.5, diğer metriklerde artış log oranıyla (en fazla 1) puanlanır.
5. Toplam = kaynak + sinyal + ivme; azalan toplama, eşitlikte kaynak sayısı ve ada göre alfabetik sırayla ilk 15 seçilir. TR boşluğu etiketi sıralamaya girmez, karta ayrı eklenir: found+çekiş(>5 TR rating) = dolu, found+çekiş yok = zayıf, not_found = boş, uncertain = belirsiz.
