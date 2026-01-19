# Personal Homepage TUI - Implementation Plan

> Design: [docs/plans/2025-01-19-tui-homepage-design.md](docs/plans/2025-01-19-tui-homepage-design.md)
> Created: 2025-01-19

## Goal

Build MVP of TUI-style personal homepage with ASCII aesthetics, 3 color themes, and responsive design.

## Phases

### Phase 1: Project Setup `pending`
- [ ] Initialize Astro project
- [ ] Install dependencies (figlet.js)
- [ ] Configure project structure
- [ ] Set up CSS variables for theming

### Phase 2: Core Styles `pending`
- [ ] Create `tui.css` base styles (monospace, dark bg)
- [ ] Create `themes.css` with 3 theme variants (Gruvbox/Frost/Amber)
- [ ] Implement responsive breakpoints
- [ ] Test font rendering

### Phase 3: Terminal Components `pending`
- [ ] `Terminal.astro` - main container with ASCII borders
- [ ] `AsciiLogo.astro` - Figlet "SHAUN" + tagline
- [ ] `Prompt.astro` - `$ ` prompt with cursor blink
- [ ] `Output.astro` - command output area
- [ ] `ThemeSwitcher.astro` - clickable color blocks

### Phase 4: Command System `pending`
- [ ] `commands.js` - command registry and handlers
- [ ] `terminal.js` - input handling, typewriter effect
- [ ] `CommandLine.astro` - input with suggestions
- [ ] Implement `/help`, `/clear`, `/theme`

### Phase 5: Content Modules `pending`
- [ ] Create content files (markdown)
- [ ] `/about` - intro + experience + education
- [ ] `/skills` - tech stack display
- [ ] `/projects` - project cards
- [ ] `/contact` - social links

### Phase 6: Mobile Adaptation `pending`
- [ ] `MobileCommands.astro` - touch command buttons
- [ ] Responsive ASCII logo
- [ ] Simplified borders on mobile
- [ ] Touch-friendly theme switcher
- [ ] Test on mobile viewport

### Phase 7: Polish & Deploy `pending`
- [ ] Typewriter welcome animation
- [ ] Performance optimization
- [ ] Lighthouse audit (target >90)
- [ ] Deploy to Cloudflare Pages
- [ ] Final testing

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| - | - | - |

## Files Modified

| Phase | Files |
|-------|-------|
| - | - |
