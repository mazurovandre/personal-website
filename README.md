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

The app runs as a Docker container (see `deploy/Dockerfile`, built with `output: 'standalone'`) and does not publish any ports itself. It joins an existing `remnawave-network` so a shared reverse-proxy container on the host (`remnawave-nginx`) can reach it by container name and terminate TLS for it, the same way other apps on that host are deployed. The suggested layout on the server is:

```text
/opt/personal-website/
├── app/       # this repository (code only)
└── content/   # rsync-managed, not stored in Git, bind-mounted read-only into the container at /content
```

Initial deploy:

1. Copy the repository (excluding `.git`, `node_modules`, `.next`, `content`, `.env*`) to `/opt/personal-website/app/` on the server, e.g. via `rsync`.
2. Copy the local `content/` directory to `/opt/personal-website/content/` on the server.
3. On the server: `cd /opt/personal-website/app && docker compose -f deploy/docker-compose.prod.yml up -d --build`.
4. On the reverse-proxy host, add a `server {}` block for the site's domain(s) pointing at the `personal-website` container on port 3000, with its own TLS certificate.

For an application update, re-sync the repository and re-run `docker compose -f deploy/docker-compose.prod.yml up -d --build`. For a content-only update, re-sync only `content/` — no restart is needed, the running process picks up changes within a minute.

## Checks

```bash
pnpm check
```

This runs ESLint, TypeScript and a production build. The project intentionally has no test framework.
