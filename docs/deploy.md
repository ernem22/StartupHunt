# Yayın ve zamanlama

Günlük koşu: `.github/workflows/daily.yml` (cron 03:17 UTC + elle tetikleme). `pnpm radar` ve `pnpm ideas` çalışır, `data/` değiştiyse `dev`'e commit edilir, `site/` + `data/ideas.json` ile `dist/` hazırlanır ve secret'lar varsa Cloudflare Pages'e yüklenir. Secret yoksa yayın adımı atlanır, koşu kırmızı olmaz.

## Sahibinin yapacakları (6 satır)

1. Cloudflare → Workers & Pages → Create → Pages → Direct Upload, proje adı `startuphunt` (Git bağlamayın).
2. Cloudflare → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" şablonu; Account → Cloudflare Pages: Edit izni ekleyin, tokenı kopyalayın.
3. Cloudflare sağ panelinden hesap kimliğini (Account ID) kopyalayın.
4. GitHub repo → Settings → Secrets and variables → Actions: `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` secret'larını ekleyin.
5. Cron yalnız varsayılan dalda (`main`) çalışır: `dev` → `main` PR'ı birleşene kadar otomatik koşu olmaz; o zamana kadar Actions → Daily → Run workflow ile elle tetikleyin.
6. Yayın adresi: `https://dev.startuphunt.pages.dev` (dev dalının önizleme takma adı; ana adres Pages panelinde görünür).

## Yerel yedek (Windows Task Scheduler)

Repo kökünden, her gün 09:00'da (PowerShell, yönetici gerekmez):

```powershell
schtasks /Create /SC DAILY /ST 09:00 /TN "StartupHunt Radar" /TR "cmd /c cd /d <repo-yolu> && pnpm radar && pnpm ideas"
```

Bu yalnız `data/` dosyalarını yerelde günceller; commit ve yayın yapmaz. Yayını elle almak için `git add data && git commit -m "chore(data): elle" && git push origin HEAD:dev`, ardından `site/` ve `data/ideas.json` dosyalarını bir dizinde birleştirip `pnpm dlx wrangler pages deploy <dizin> --project-name=startuphunt` çalıştırın.

## Yerelde görüntüleme

`pnpm radar && pnpm ideas`, ardından workflow ile aynı yayın dizinini kurun ve servis edin: `site/` ve `data/ideas.json` birlikte `dist/` altında olmalıdır (`site/app.js` veriyi `data/ideas.json` göreli yolundan okur). PowerShell: `Remove-Item dist -Recurse -ErrorAction SilentlyContinue; New-Item -ItemType Directory dist/data -Force | Out-Null; Copy-Item site/* dist -Recurse; Copy-Item data/ideas.json dist/data/`, sonra `npx --yes serve -l 8080 dist` ve `http://localhost:8080` açın.
