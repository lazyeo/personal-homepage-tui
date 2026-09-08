# Personal Homepage TUI

## Portfolio preview

The accepted baseline is now `/`: the terminal-computer Hero plus the layered,
click-selected 3D project collection. Continue future work on `src/pages/index.astro`,
`TerminalHero.astro`, `ProjectShowcase.astro`, `project-selection.ts`, and
`experience-scene.ts`. `/exhibit/` and `/studio/` only redirect to `/`.
Retired editions are recoverably archived under `.impeccable/archive/retired-editions/`
and are not built or offered in navigation.

The homepage now presents selected work, with case studies at `/work/mrsl/`,
`/work/careermatch/`, and `/work/kids-worksheets/`. The original terminal is at
`/terminal/`. Clicking the homepage computer or terminal links loads that route
inside a same-origin drawer sliding in from the right, preserving its state when
closed and reopened. Full screen expands the drawer in place; Back to sidebar
restores its width without navigation or reloading the terminal. The standalone
terminal includes an explicit Back to portfolio link.

Run `npm run dev` for development, or `npm run build` followed by
`npm run preview -- --port 4322` for the production preview.

The Hero computer uses CSS perspective and pointer interaction. The separate
project collection loads its WebGL runtime only when it enters the viewport,
and renders on demand. Reduced-motion preferences keep a usable static view.
Portfolio content lives in `src/data/projects.ts`. It is a reviewed public subset,
not an automatic import of private resume data or the Cloudflare KV chat context.

`astro dev` and `astro preview` do not run Cloudflare Pages Functions: terminal
commands work locally, while real AI replies require the configured Pages
Function environment described below. This preview does not publish or change it.

The `SAMEORIGIN` framing header allows the portfolio's terminal dialog while
continuing to block embedding by third-party sites. MRSL uses an existing rebuild
screenshot; the other project visuals are labeled illustrations. Font licenses
are included in `public/fonts/`.

Browser acceptance tests (with optional external Playwright tooling):

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-project-showcase.mjs
```

The runner tests the canonical homepage, legacy redirects, project picking,
terminal persistence, case-study return paths, responsive layouts and fallbacks.

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
- `/api/chat` applies server-side rate limiting through the `PORTFOLIO_CONTEXT` KV binding. Optional controls: `CHAT_RATE_LIMIT_MAX_REQUESTS`, `CHAT_RATE_LIMIT_WINDOW_SECONDS`, `CHAT_RATE_LIMIT_SALT`, and comma-separated `CHAT_RATE_LIMIT_BYPASS_IPS` for trusted testing IPs.

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

The AI chat always includes the reviewed homepage projects from `src/data/projects.ts`
(MRSL, CareerMatch AI, and Kids Worksheet Generator). Their contributions, technologies,
links and evidence limits take precedence over outdated supplemental text. Updating this
shared data and deploying the Pages Function updates both surfaces; a frontend-only
preview does not update the live AI endpoint.

Cloudflare KV provides supplementary public background and other projects. Long context
is selected by markdown section, with Chinese/English project intent and recent user
turns supporting broad questions and follow-ups. The shared projects reserve space
within the 8,000-character context budget before KV sections are selected.

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
