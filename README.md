# Personal website

A small SSR portfolio built as a pnpm/Turborepo monorepo:

- `apps/web` — Next.js website and SEO metadata;
- `apps/api` — NestJS contact endpoint;
- `packages/contracts` — shared Zod schemas;
- `content/` — personal content, always ignored by Git;
- `deploy/nginx` — production reverse-proxy example.

## Local development

Use Node.js 24 or newer and pnpm 10. Copy `.env.example` to `.env`, provide SMTP values, then run:

```bash
pnpm install
pnpm content:validate
pnpm dev
```

The website is served at `http://localhost:3000`; the API listens on `http://localhost:3001`. In local development, either proxy `/api` to port 3001 or set up the supplied Nginx configuration. Production uses one origin, so the browser always posts to `/api/contact`.

Run all non-browser checks with `pnpm check`.

## Content

The complete `content/` directory is excluded by `.gitignore`. It contains:

- `site.json` — labels, links, CV settings and SEO;
- `about.md` — About dialog copy;
- `privacy.md` — privacy page copy;
- `cv/cv.pdf` — the only CV source;
- `media/` — optional public images.

The web process reads these files at request time and caches valid content for up to one minute. Invalid content fails closed instead of replacing the active version.

## Publish content over SFTP

On the VPS, upload a complete content set to `/srv/personal-website/content/incoming/`. Then, from the checked-out application directory, run:

```bash
pnpm content:publish
```

The command validates the upload, switches the `active` symlink, recreates the empty `incoming` directory and deletes the former active release. It intentionally keeps no backup. Keep your own local copy because a deleted server file cannot be restored from Git.

## VPS deployment

1. Point the domain to the VPS and replace `example.com` in `deploy/nginx/personal-website.conf`.
2. Install Docker, Docker Compose, Nginx and Certbot.
3. Put production secrets in `.env`; never commit this file.
4. Publish the first content release so `/srv/personal-website/content/active` exists.
5. Set `SITE_URL`, `WEB_IMAGE` and `API_IMAGE`, then run `docker compose up -d`.
6. Install the Nginx config, obtain a Let’s Encrypt certificate and reload Nginx.

Only Nginx exposes public ports. The application containers bind to loopback, and personal content is mounted read-only into the web container.
