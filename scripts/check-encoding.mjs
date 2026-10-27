import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const extensions = new Set([".md", ".sql", ".ts", ".json"]);

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => extensions.has(file.slice(file.lastIndexOf("."))));

const broken = files.filter((file) => readFileSync(file, "utf8").includes("\uFFFD"));

if (broken.length > 0) {
  console.error("encoding: U+FFFD bulunan dosyalar:");
  for (const file of broken) console.error(`  ${file}`);
  process.exit(1);
}

console.log(`encoding: ${files.length} dosya temiz`);
