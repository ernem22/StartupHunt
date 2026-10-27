import { spawnSync } from "node:child_process";

for (const command of ["python3", "python"]) {
  const result = spawnSync(command, ["-m", "compileall", "-q", "cluster", "collectors"], {
    stdio: "inherit",
  });
  if (!result.error) process.exit(result.status ?? 1);
  if (result.error.code !== "ENOENT") {
    console.error(result.error.message);
    process.exit(1);
  }
}

console.error("python bulunamadı");
process.exit(1);
