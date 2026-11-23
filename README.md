# Personal Homepage TUI

## Portfolio

The homepage at `/` is written for a recruiter's first 30 seconds: a hero with
role, stack, work rights and contact links (`TerminalHero.astro`), every selected
project visible at once (`ProjectShowcase.astro`), Experience and How I work
(`Experience.astro`), and a Contact section. `/exhibit/` and `/studio/` only
redirect to `/`.

Case studies live at `/work/<slug>/` for every project in `src/data/projects.ts`:
Nimpression Ops, Alma Android, Kids Worksheet Generator, MRSL and Pocket Home.
`/work/careermatch/` was removed and 301-redirects to `/#work` (`public/_redirects`);
unknown paths get the 404 page. `src/data/projects.ts` is a reviewed public subset,
not an automatic import of private resume data or the Cloudflare KV chat context;
the homepage cards, the case studies, the terminal's `/projects` and the AI chat all
read it.

The original terminal is at `/terminal/`. The homepage computer and the Open
terminal link load it inside a same-origin drawer sliding in from the right,
preserving its state when closed and reopened. The standalone terminal includes
an explicit Back to portfolio link.

Run `npm run dev` for development, or `npm run build` followed by
`npm run preview -- --port 4322` for the production preview.

`astro dev` and `astro preview` do not run Cloudflare Pages Functions or apply
`public/_headers` / `public/_redirects`: terminal commands work locally, while real
AI replies, the CSP and the redirects only apply on Cloudflare Pages.

Security headers are in `public/_headers`, including an enforced
Content-Security-Policy: scripts, fonts and styles come from the site itself (no
inline script, so Astro is configured not to inline small scripts), images from the
site plus `data:`/`blob:`, and `connect-src` adds only the GitHub contributions API
used by the terminal heatmap. `SAMEORIGIN` framing allows the terminal drawer and
the ky01 viewer while blocking third-party embedding. Font licenses are in
`public/fonts/`.

Browser acceptance test (install `playwright-core` outside this package and point
at a running preview):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright-core/index.mjs PORTFOLIO_URL=http://127.0.0.1:4322 node scripts/check-project-showcase.mjs
```

It checks the hero facts and contact links above the fold, the navigation, all
projects visible in order (also without JavaScript), Experience, 44px tap targets,
the terminal drawer, 320/390/768px layouts without horizontal overflow, case-study
return links and the legacy redirects.

A terminal-style personal portfolio website built with Astro, featuring command-line interaction aesthetics while maintaining modern web usability.

## Features

- 🖥️ **TUI Aesthetic** - Terminal-inspired design with monospace fonts, cursor effects, and ASCII borders
- ⌨️ **Command Interaction** - Navigate via terminal commands (`help`, `about`, `projects`, etc.)
- 🖱️ **Mouse Friendly** - Full mouse support for scrolling, clicking links, and copying text
- 🌐 **Bilingual** - English (default, for NZ employers) and Chinese support
- ⚡ **Fast** - Astro static site generation, deployed on Cloudflare Pages

## Content Modules

- `about` - Personal introduction
- `skills` - Tech stack and expertise
- `projects` - Portfolio showcase
- `experience` - Work history
- `education` - Academic background
- `blog` - Articles and thoughts
- `contact` - Social links and contact info

## Tech Stack

- **Framework**: Astro
- **Styling**: CSS (TUI-themed)
- **Deployment**: Cloudflare Pages
- **i18n**: astro-i18n

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## AI Chat Configuration

AI provider credentials must be configured as server-side Cloudflare Pages environment variables, not browser-exposed `PUBLIC_*` variables.

For OpenAI-compatible / GPT-compatible providers:

```bash
AI_PROVIDER=openai
AI_BASE_URL=https://your-compatible-base-url/v1
AI_API_KEY=your_server_side_api_key_here
AI_MODEL=your-model-name
```

Security notes:

- Do not use `PUBLIC_AI_API_KEY`, `PUBLIC_AI_PROVIDER`, or `PUBLIC_AI_MODEL` for AI credentials/config; Astro exposes `PUBLIC_*` variables to browser bundles.
- Browser code calls the same-origin `/api/chat` endpoint only; provider calls happen in Cloudflare Pages Functions.
- Gemini requests use the `x-goog-api-key` header instead of putting the key in the URL.
- Provider error details returned to visitors are generic, and server logs redact common key patterns.
- `/api/chat` accepts POSTs only from `https://hi.a-dobe.club` and `*.shaun-page-tui.pages.dev` (checked on the `Origin` header; anything else, or no Origin, gets 403). It sends no CORS headers and answers other methods, including preflight, with 405.
- `/api/chat` applies server-side rate limiting through the `PORTFOLIO_CONTEXT` KV binding: a per-IP hourly limit plus a global daily cap counted under `rate_limit:global:<UTC date>`. Optional controls: `CHAT_RATE_LIMIT_MAX_REQUESTS`, `CHAT_RATE_LIMIT_WINDOW_SECONDS`, `CHAT_GLOBAL_DAILY_LIMIT` (default 500), `CHAT_RATE_LIMIT_SALT`, and comma-separated `CHAT_RATE_LIMIT_BYPASS_IPS` for trusted testing IPs (bypasses both limits). Once the daily cap is reached, visitors are asked to email instead.

## Commands (In-site)

```
$ help          - Show available commands
$ about         - About me
$ skills        - Technical skills
$ projects      - View projects
$ experience    - Work experience
$ education     - Education background
$ blog          - Blog posts
$ contact       - Contact information
$ lang zh       - Switch to Chinese
$ lang en       - Switch to English
$ clear         - Clear terminal
```

## License

MIT

## Public Portfolio Context Updates

The AI chat always includes every project from `src/data/projects.ts` (the reviewed
homepage projects and the archive list). Their contributions, technologies, links and
evidence limits take precedence over outdated supplemental text. Updating this shared
data and deploying the Pages Function updates both surfaces; a frontend-only preview
does not update the live AI endpoint.

Cloudflare KV provides supplementary public background. The whole KV document goes
into the system prompt as quoted material, capped at 60,000 characters; nothing is
selected per question. The corpus is a few thousand tokens, so the system prompt is
identical across requests and can be cached by the provider. The conversation history
arrives from the browser as the visitor's unverified report, capped at 10 turns and
6,000 characters, newest first.

Run the endpoint regression tests without credentials or model charges (Node 22.18+):

```bash
node --test scripts/test-chat-context.mjs
```

These exercise the actual endpoint and provider request serialization, substituting
only KV and the external model response. They verify what the model receives, not
the quality of a live model answer. After deploying, verify both a fresh Chinese/
English project question and an MRSL follow-up against the live `/api/chat` endpoint.

Required Pages Function binding:

```text
Binding name: PORTFOLIO_CONTEXT
KV key: portfolio_context:latest
```

Optional environment variable:

```bash
PORTFOLIO_CONTEXT_KEY=portfolio_context:latest
```

The supplementary context source is intentionally outside this public repo. Pass it
via `PORTFOLIO_CONTEXT_SOURCE` or `--source <path>`. Never publish the private
`my_profile.json` wholesale. Homepage project updates do not require overwriting KV.

Review and publish helpers:

```bash
node scripts/review-public-portfolio-context.mjs <local-public-context.md>
node scripts/publish-public-portfolio-context.mjs --source <local-public-context.md> --dry-run
node scripts/publish-public-portfolio-context.mjs --source <local-public-context.md> --namespace-id <kv_namespace_id> --remote
```
