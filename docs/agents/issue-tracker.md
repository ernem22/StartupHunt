# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues in `ernem22/StartupHunt`. Use the `gh` CLI for all operations; run it inside the clone so the repo is inferred.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc or `--body-file` for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: this machine has `gh` 2.23, so use the REST endpoint: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>`, where `<child-db-id>` is the child's numeric database id (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`). The `gh issue create --parent` / `--add-sub-issue` shortcuts need `gh` 2.94+. Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's native issue dependencies are the canonical, UI-visible representation. Add an edge with `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric database id (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). The `--blocked-by` / `--add-blocked-by` shortcuts need `gh` 2.94+. Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable).
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

File issues only into the user's own repo. Never file into `mattpocock/skills` (the repo these skills come from) unless the user owns it. In a fork, `gh` can default to the upstream parent, so before the first `gh issue create` of a session, check the target with `gh repo view --json nameWithOwner` and confirm it with the user if it is not their repo.

## Repo workflow

- Her değişiklik kendi branch'i + PR'ı: `feat/<konu>`, `fix/<konu>`, `chore/<konu>`; base `main`.
- İlk commit'ten önce branch açılır; repo kuralı generic harness talimatından önce gelir. Tikete başlamadan `git status` temiz olmalı; ilgisiz değişiklikler ayrı PR'da toplanır.
- Her anlamlı adım `LOG.md`'ye (tarih, ne, sonuç, sonraki adım) yazılır — merge öncesi dahil.
- Plan/kapsam değişikliği gerektiren karar önce `plan.md`'ye, sonra koda yazılır.
- Commit yalnız kendi işini kapsar; secret (token/key) commit edilmez.
- PR body: ne yapıldı + doğrulanamayan kısımlar.

## Windows PowerShell 5.1

- Basit, tek satır filtrelerde `--jq '...'` güvenli.
- İç içe tırnak/backtick gereken filtrelerde JSON'u PowerShell'e bırak: `gh issue list --json number,title,labels | ConvertFrom-Json`.
- Alternatif: `gh issue list --template '{{range .}}{{.number}} {{.title}}{{"\n"}}{{end}}'`.
- `gh pr edit` "Projects (classic)" GraphQL hatası verirse body'yi REST ile güncelle: `gh api --method PATCH repos/<owner>/<repo>/pulls/<n> --input body.json` (JSON: `{"body":"..."}`).
- `@me` gibi değerleri tırnakla: `--add-assignee "@me"`; aksi halde PowerShell argümanı böler.
- Bu makinede `rg` olmayabilir; içerik aramada Grep/Read araçlarını kullan. Konsol Türkçe çıktısını mojibake gösterebilir; dosya içeriğini Read ile doğrula.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number>`, then `gh pr view <number> --comments` (off a TTY, `--comments` prints only the comments, not the body), and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh api --paginate 'repos/{owner}/{repo}/pulls?state=open' --jq '.[] | select(.author_association | IN("OWNER","MEMBER","COLLABORATOR") | not) | {number, title, author: .user.login, author_association, labels: [.labels[].name]}'`. (This `gh` version has no `authorAssociation` field on `gh pr list --json`.)
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either: resolve with `gh pr view 42` and fall back to `gh issue view 42 --json number,title,body,labels,comments`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --json number,title,body,labels,comments`.

## When a ticket is done

Tickets produced by `/to-tickets` or `/to-spec` are already agent-ready: work them with `/implement` or `/implement-spec`, and keep `/triage` for issues someone else raised.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children (`gh issue list --state open`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line) or an assignee; first in map order wins.
- **Claim**: `gh issue edit <n> --add-assignee "@me"`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n>`, then append a context pointer (gist + link) to the map's Decisions-so-far.
