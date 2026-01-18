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
