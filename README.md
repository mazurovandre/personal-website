# Personal website

A small server-rendered portfolio built with Next.js. There is no separate backend, database, CMS, analytics or contact form.

## Local development

Use Node.js 24 or newer and pnpm 10:

```bash
pnpm install
pnpm content:validate
pnpm dev
```

The site is available at `http://localhost:3000`.

## Content

Personal content lives in the root `content/` directory, which is entirely excluded from Git:

- `site.json` — name, role, labels, contacts, CV settings and SEO metadata;
- `about.md` — text in the About dialog;
- `cv/cv.pdf` — the CV displayed and downloaded by the site.

Run `pnpm content:validate` before uploading changes. The server checks the files again at runtime and caches a valid version for up to one minute. If an SFTP upload is temporarily incomplete or invalid, a running process continues serving the last valid version.

## VPS deployment

The suggested layout is:

```text
/srv/personal-website/
├── app/       # this repository
└── content/   # SFTP-managed, not stored in Git
```

1. Copy `.env.example` to `.env` and set the real `SITE_URL` and `CONTENT_DIR`.
2. Install dependencies and build: `pnpm install --frozen-lockfile && pnpm build`.
3. Install `deploy/systemd/personal-website.service`, enable it and start it.
4. Replace `example.com` in `deploy/nginx/personal-website.conf`, install the config and obtain a Let’s Encrypt certificate with Certbot.
5. Upload content changes directly to `/srv/personal-website/content/` over SFTP. Keep a local copy; the server creates no backups.

For an application update, fetch the new code, run `pnpm install --frozen-lockfile && pnpm build`, then restart `personal-website.service`. Content is not touched by this process.

## Checks

```bash
pnpm check
```

This runs ESLint, TypeScript and a production build. The project intentionally has no test framework.
