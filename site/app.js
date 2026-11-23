// Fikir listesi: data/ideas.json okur ve kartları DOM API ile çizer (innerHTML yok; veri dış kaynaklardan gelir).
const DATA_URL = "data/ideas.json";
const FILTERS = ["tümü", "boş", "zayıf", "dolu", "belirsiz"];

const meta = document.getElementById("meta");
const status = document.getElementById("status");
const list = document.getElementById("ideas");
let ideas = [];
let filter = "tümü";

function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}

// Yalnız http(s) bağlantılarına izin ver; diğer şemalar (javascript: vb.) reddedilir.
function safeHref(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function link(url, text) {
  const href = safeHref(url);
  if (!href) return el("span", text);
  const a = el("a", text);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

function formatValue(value) {
  return typeof value === "number"
    ? value.toLocaleString("tr-TR", { maximumFractionDigits: 1 })
    : String(value);
}

function card(idea) {
  const gap = idea.tr?.gapLabel ?? "belirsiz";
  const article = el("article", undefined, "card");

  const title = el("h2");
  title.append(`${idea.rank}. `, link(idea.url, idea.name));
  article.append(title);

  article.append(el("p", idea.whatItIs ?? ""));
  article.append(
    el(
      "p",
      `Kategori: ${idea.category ?? "—"} · Kaynaklar: ${(idea.sources ?? []).join(", ")} · Skor: ${idea.score?.total ?? "—"}`,
      "muted",
    ),
  );

  article.append(el("div", "Veri noktaları", "section-title"));
  const points = el("ul");
  for (const point of idea.dataPoints ?? []) {
    const li = el(
      "li",
      `${point.source} · ${point.metric}: ${formatValue(point.value)} (${point.date}) `,
    );
    li.append(link(point.url, "kaynak"));
    points.append(li);
  }
  article.append(points);

  article.append(el("div", "Gelir kanıtı", "section-title"));
  article.append(el("p", idea.revenueEvidence || "Yok"));

  article.append(el("div", "Türkiye pazarı", "section-title"));
  const badge = el("span", `TR boşluğu: ${gap}`, `badge gap-${gap}`);
  article.append(badge);
  article.append(el("p", idea.tr?.reason ?? ""));
  if (idea.tr?.queries?.length) {
    article.append(el("p", `Sorgular: ${idea.tr.queries.join(" | ")}`, "muted"));
  }
  if (idea.tr?.evidence?.length) {
    const evidence = el("ul");
    for (const item of idea.tr.evidence) {
      const li = el("li", `${item.channel} · ${item.name} `);
      li.append(link(item.url, "kanıt"));
      evidence.append(li);
    }
    article.append(evidence);
  }
  return article;
}

function render() {
  const visible = filter === "tümü" ? ideas : ideas.filter((idea) => idea.tr?.gapLabel === filter);
  list.replaceChildren(...visible.map(card));
  status.textContent =
    visible.length === 0 ? "Bu filtrede fikir yok." : `${visible.length} fikir gösteriliyor.`;
  for (const button of document.querySelectorAll("[data-filter]")) {
    button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
  }
}

document.querySelector(".filters").addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement) || !FILTERS.includes(target.dataset.filter)) return;
  filter = target.dataset.filter;
  render();
});

async function load() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    ideas = Array.isArray(data.ideas) ? data.ideas : [];
    meta.textContent = `Üretim: ${data.generatedAt ?? "bilinmiyor"} · ${ideas.length} fikir`;
    render();
  } catch (error) {
    meta.textContent = "Veri yüklenemedi.";
    status.textContent = `Hata: ${error instanceof Error ? error.message : "bilinmeyen hata"}`;
  }
}

load();
