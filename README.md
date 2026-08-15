<p align="center">
  <strong style="font-size: 1.6rem">Oracle Cloud Hub</strong><br/>
  <em>One place to learn modern Oracle — end to end</em>
</p>

<p align="center">
  Oracle Fusion Cloud · Oracle Integration Cloud (OIC) · Visual Builder Cloud Service (VBCS) ·
  Oracle SQL · PL/SQL · Analytics (OTBI · OAC · OBIEE)
</p>

---

**Oracle Cloud Hub** is a self-paced study guide that takes you from the foundations of database
and SQL all the way to production PL/SQL, Fusion integrations, and enterprise analytics — in one
ordered learning path with full-text search.

## What's inside

- **Oracle Fusion Cloud** — ERP Financials, Procurement & SCM, REST/FBDI/ESS technical layer,
  reporting & analytics, and end-to-end architecture.
- **Oracle SQL** — 23 pages from `SELECT` and data types to joins, subqueries, analytic/window
  functions, indexing, partitioning, JSON/XML, and security.
- **PL/SQL** — 15 pages: blocks, control flow, cursors, procedures, functions, packages,
  triggers, collections, **bulk processing (BULK COLLECT / FORALL)**, files & REST, performance,
  and secure deployment.
- **Oracle Integration Cloud (OIC)** and **Visual Builder (VBCS)** — the integration and
  low-code layers, with patterns for Fusion (REST + FBDI).
- **Analytics** — OTBI, Oracle Analytics Cloud (OAC), and OBIEE, with a "which engine when" guide.
- **Troubleshooting, scenarios, and glossary** — diagnostics for REST, FBDI, ESS, GL/AP/AR, and more.

Every SQL/PL-SQL example is written against a real Oracle database and every page follows the
same running schema (`regions → customers → orders`).

## Tech

- [Next.js](https://nextjs.org) (App Router) — fully **static** export
- TypeScript + Tailwind CSS
- Full-text client-side search (`/search-index.json`)
- Syntax-highlighted SQL/PL-SQL code blocks

## Getting started locally

```bash
npm install
npm run dev     # http://localhost:3000  (builds the search index automatically)
```

Production build:

```bash
npm run build   # produces ./out (static export)
```

## Deploying to GitHub Pages

The repo ships a ready-to-use workflow (`.github/workflows/deploy-pages.yml`):

1. Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. Push to `master`/`main` — the workflow builds the static site and deploys it.
3. For a project repo (this one), the workflow already sets
   `NEXT_PUBLIC_BASE_PATH: "/OracleHub"`. For a user site (`<you>.github.io`), set it to `""`.

## Disclaimer

An independent study guide — not affiliated with, endorsed by, or sponsored by Oracle
Corporation. Oracle, Fusion Cloud, OIC, and VBCS are trademarks of their respective owners.

All SQL/PL-SQL examples are illustrative and version-dependent. Run them only in a disposable
learning environment — never against a production or business-critical database.

## Author

Curated by **Raja Mani Kumar Molleti** — learn · build · share.

## License

**All rights reserved.** © 2026 Raja Mani Kumar Molleti. The source
code and content in this repository may not be copied, distributed, or
reused without permission, except for personal, non-commercial study.
See [LICENSE](./LICENSE).