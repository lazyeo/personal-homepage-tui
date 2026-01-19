# Personal Homepage TUI - MVP Design

> Created: 2025-01-19
> Status: Approved

## Overview

TUI-style personal homepage targeting New Zealand employers, featuring ASCII art aesthetics with modern web usability.

## Brand Identity

```
SHAUN (Figlet ASCII art)
Christchurch · Product-Minded Vibe Coder
```

## Visual Design

### Color Themes (3 options, user-switchable)

| Theme | Primary | Background | Vibe |
|-------|---------|------------|------|
| **Gruvbox** (default) | `#8ec07c` | `#1d2021` | Classic dev |
| **Frost** | `#89b4a6` | `#1e2030` | Cool professional |
| **Amber** | `#d4a373` | `#1b1b1b` | Warm retro |

Design principle: Low saturation, eye-friendly colors.

### ASCII Art Style

- Window borders: Box-drawing characters `┌─┐│└─┘`
- Titles: Figlet.js generated ASCII art
- Decorations: Pure ASCII, no Unicode emojis
- Theme indicator: `[■] [□] [□]` clickable blocks in top-right

### Typography

- Font: Monospace (JetBrains Mono / Fira Code)
- Desktop: 14-16px
- Mobile: Adjusted for readability

## Interaction Design

### Command System

- Format: Slash commands (`/about`, `/help`, etc.)
- Prompt: `$ ` (classic style)
- Input hints: Show suggestions while typing

### Startup Sequence

1. ASCII Logo (Figlet "SHAUN")
2. Brand tagline: `Christchurch · Product-Minded Vibe Coder`
3. Typewriter welcome message
4. Blinking cursor at prompt `$ _`

### Theme Switching

- Command: `/theme gruvbox`, `/theme frost`, `/theme amber`
- UI: Clickable color blocks in top-right corner

## MVP Commands

| Command | Content |
|---------|---------|
| `/help` | List available commands |
| `/about` | Personal intro + work experience + education |
| `/skills` | Tech stack |
| `/projects` | Project showcase |
| `/contact` | Social links & contact info |
| `/theme <name>` | Switch color theme |
| `/clear` | Clear terminal screen |

## Responsive Design

### Breakpoints

| Device | Width | Strategy |
|--------|-------|----------|
| Desktop | ≥768px | Full ASCII borders, keyboard input |
| Mobile | <768px | Simplified borders, touch-friendly |

### Mobile Adaptations

| Element | Desktop | Mobile |
|---------|---------|--------|
| ASCII Logo | Full Figlet | Smaller or simplified |
| Window border | Complete box | Simplified (top/bottom only) |
| Theme blocks | Small clickable | Larger touch targets |
| Command input | Keyboard typing | **Clickable command buttons** |
| Font size | 14-16px | Ensure readability |

### Mobile Command Buttons

Bottom section displays tappable buttons:
```
[about] [skills] [projects] [contact]
```

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro |
| ASCII Titles | Figlet.js |
| Styling | Native CSS + CSS Variables |
| Language | English only (i18n architecture reserved) |
| Deployment | Cloudflare Pages |

## File Structure

```
src/
├── components/
│   ├── Terminal.astro        # Terminal container
│   ├── CommandLine.astro     # Command input + suggestions
│   ├── Output.astro          # Output area
│   ├── Prompt.astro          # $ prompt
│   ├── AsciiLogo.astro       # Figlet logo
│   ├── ThemeSwitcher.astro   # Theme color blocks
│   └── MobileCommands.astro  # Mobile command buttons
├── content/
│   └── en/                   # English content (markdown)
├── layouts/
│   └── Layout.astro
├── pages/
│   └── index.astro
├── scripts/
│   ├── terminal.js           # Terminal interaction logic
│   └── commands.js           # Command handlers
└── styles/
    ├── tui.css               # Base TUI styles
    └── themes.css            # Theme variables
```

## Out of Scope (Phase 2+)

- Chinese language support (`/lang zh`)
- Blog module (`/blog`)
- Tab completion
- Command history (up/down arrows)
- More themes

## Success Criteria

1. Loads fast (<2s on 3G)
2. ASCII art renders correctly on all devices
3. All 7 commands work as expected
4. Theme switching is smooth
5. Mobile experience is touch-friendly
6. Lighthouse score >90
