# Personal Homepage TUI

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

The AI chat reads public-facing profile context from a Cloudflare KV binding at runtime. Long context is split by markdown sections and the endpoint selects sections relevant to the visitor's question instead of blindly sending only the first chunk.

Required Pages Function binding:

```text
Binding name: PORTFOLIO_CONTEXT
KV key: portfolio_context:latest
```

Optional environment variable:

```bash
PORTFOLIO_CONTEXT_KEY=portfolio_context:latest
```

Local source of truth is intentionally outside this public repo. Pass it via `PORTFOLIO_CONTEXT_SOURCE` or `--source <path>`.

Review and publish helpers:

```bash
node scripts/review-public-portfolio-context.mjs --source <local-public-context.md>
node scripts/publish-public-portfolio-context.mjs --source <local-public-context.md> --dry-run
node scripts/publish-public-portfolio-context.mjs --source <local-public-context.md> --namespace-id <kv_namespace_id> --remote
```
