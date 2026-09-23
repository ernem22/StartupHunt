// Dil tespiti — FAZ 4 (plan v3.1: toplama anında, hızlı/ucuz)
// franc-min: 82 dil, 3-gram istatistiksel; tek dosya, API'siz.
// Not: kısa metinlerde (<20 karakter) güvenilir değil → null döner, sinyal kaybı olmaz.
import { franc } from "franc-min";

const SUPPORTED = new Set(["eng", "tur"]); // bugün ilgilenen diller; küme genişleyebilir

export function detectLanguage(title: string | null, text: string): string | null {
  const sample = `${title ?? ""}\n${text}`.slice(0, 1000);
  if (sample.trim().length < 20) return null;
  const code = franc(sample);
  if (!SUPPORTED.has(code)) return null; // eng/tur dışı: null → FAZ 6'da yine embed edilir
  return code === "eng" ? "en" : code === "tur" ? "tr" : null;
}
