/** Product names in raw feeds are often whole Show HN headlines. Keep only the short prefix before a separator. */
export function shortProductName(name: string): string {
  let text = name.replace(/\s+/g, " ").trim();
  text = text.replace(/^Show\s+HN\s*:\s*/i, "");
  // Em/en dash, colon or parenthesis separates the product from its tagline.
  text = text.split(/\s+[–—-]\s+|\s*:\s*|\s+\(|,\s/)[0] ?? text;
  text = text
    .replace(/^I (?:built|made|created)\s+(?:a|an|my)\s+/i, "")
    .replace(/^(?:a|an|the)\s+/i, "")
    .replace(/[.,!?]+$/, "")
    .trim();
  // A name longer than five words is a sentence, not a product name.
  const words = text.split(" ");
  if (words.length > 5) {
    const trailing = new Set([
      "a",
      "an",
      "the",
      "that",
      "of",
      "and",
      "with",
      "for",
      "in",
      "on",
      "to",
    ]);
    const prefix = words.slice(0, 3);
    while (prefix.length > 1 && trailing.has(prefix[prefix.length - 1]!.toLowerCase()))
      prefix.pop();
    return prefix.join(" ");
  }
  return text || name.trim();
}

/** TR search queries: short name + at most two keywords from the description. No long headline queries. */
export function shortTrQueries(name: string, description?: string): string[] {
  const short = shortProductName(name);
  const queries = [short];
  if (description) {
    const stop = new Set([
      "a",
      "an",
      "the",
      "and",
      "for",
      "with",
      "that",
      "this",
      "your",
      "you",
      "from",
      "into",
      "bir",
      "ile",
      "ve",
      "için",
      "olan",
      "yapay",
      "zeka",
      "app",
      "tool",
      "built",
      "made",
      "site",
      "website",
      "page",
      "online",
      "product",
      "using",
      "with",
    ]);
    const useful = description
      .toLowerCase()
      .replace(/[^a-zçğıöşü\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stop.has(word));
    const keywords: string[] = [];
    for (const word of useful) {
      if (!keywords.includes(word)) keywords.push(word);
      if (keywords.length === 2) break;
    }
    if (keywords.length > 0) queries.push(`${short} ${keywords.join(" ")}`);
  }
  return queries;
}
