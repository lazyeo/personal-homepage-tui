// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// Each command returns HTML string to be rendered in output
// ═══════════════════════════════════════════════════════════════

export const commands = {
  help: () => `
<div class="output__section">AVAILABLE COMMANDS</div>
<div class="output__line"><span class="output__line--accent">/help</span>      - Show this help message</div>
<div class="output__line"><span class="output__line--accent">/about</span>     - About me, experience & education</div>
<div class="output__line"><span class="output__line--accent">/skills</span>    - Technical skills & tools</div>
<div class="output__line"><span class="output__line--accent">/projects</span>  - Featured projects</div>
<div class="output__line"><span class="output__line--accent">/contact</span>   - Get in touch</div>
<div class="output__line"><span class="output__line--accent">/theme</span>     - Change color theme (gruvbox|frost|amber)</div>
<div class="output__line"><span class="output__line--accent">/clear</span>     - Clear terminal</div>
`,

  about: () => `
<div class="output__section">ABOUT ME</div>
<div class="output__line">Hi! I'm <span class="output__line--accent">Shaun</span>, a Product-Minded Vibe Coder based in Christchurch, New Zealand.</div>
<div class="output__line output__line--muted"></div>
<div class="output__line">I build things that matter — combining technical skills with product thinking</div>
<div class="output__line">to create software that users actually love.</div>

<div class="output__section">EXPERIENCE</div>
<div class="ascii-box">
  <div class="ascii-box__header">[ Current Role ]</div>
  <div class="output__line">Software Developer</div>
  <div class="output__line output__line--secondary">Building web applications and solving interesting problems.</div>
</div>

<div class="output__section">EDUCATION</div>
<div class="output__line">Computer Science Background</div>
<div class="output__line output__line--secondary">Continuous learner, always exploring new technologies.</div>
`,

  skills: () => `
<div class="output__section">TECHNICAL SKILLS</div>

<div class="output__line output__line--accent">Languages</div>
<div class="output__line">  JavaScript/TypeScript · Python · Go · Rust</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Frontend</div>
<div class="output__line">  React · Vue · Astro · Next.js · Tailwind CSS</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Backend</div>
<div class="output__line">  Node.js · FastAPI · PostgreSQL · Redis</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Tools & Platforms</div>
<div class="output__line">  Git · Docker · AWS · Cloudflare · Vercel</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Interests</div>
<div class="output__line">  AI/ML · Developer Tools · Product Design · Open Source</div>
`,

  projects: () => `
<div class="output__section">FEATURED PROJECTS</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Project 1 ]</div>
  <div class="output__line">Coming soon...</div>
  <div class="output__line output__line--secondary">Add your projects here!</div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Project 2 ]</div>
  <div class="output__line">Coming soon...</div>
  <div class="output__line output__line--secondary">Showcase your best work.</div>
</div>

<div class="output__line output__line--muted"></div>
<div class="output__line">Run <span class="output__line--accent">/contact</span> to discuss potential collaborations.</div>
`,

  contact: () => `
<div class="output__section">GET IN TOUCH</div>

<div class="output__line"><span class="output__line--accent">Email</span>     → <a href="mailto:hello@example.com">hello@example.com</a></div>
<div class="output__line"><span class="output__line--accent">GitHub</span>    → <a href="https://github.com/shaun" target="_blank" rel="noopener">github.com/shaun</a></div>
<div class="output__line"><span class="output__line--accent">LinkedIn</span>  → <a href="https://linkedin.com/in/shaun" target="_blank" rel="noopener">linkedin.com/in/shaun</a></div>

<div class="output__line output__line--muted"></div>
<div class="output__line">Feel free to reach out for opportunities, collaborations, or just to say hi!</div>
`,

  theme: (args) => {
    const validThemes = ['gruvbox', 'frost', 'amber'];
    const theme = args?.[0]?.toLowerCase();

    if (!theme) {
      const current = document.documentElement.getAttribute('data-theme') || 'gruvbox';
      return `
<div class="output__line">Current theme: <span class="output__line--accent">${current}</span></div>
<div class="output__line output__line--secondary">Usage: /theme [gruvbox|frost|amber]</div>
`;
    }

    if (!validThemes.includes(theme)) {
      return `
<div class="output__line output__line--secondary">Unknown theme: ${theme}</div>
<div class="output__line">Available themes: <span class="output__line--accent">${validThemes.join(', ')}</span></div>
`;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update theme switcher dots
    document.querySelectorAll('.theme-switcher__dot').forEach(dot => {
      const isActive = dot.getAttribute('data-theme-id') === theme;
      dot.setAttribute('data-active', isActive ? 'true' : 'false');
    });

    return `<div class="output__line">Theme changed to <span class="output__line--accent">${theme}</span></div>`;
  },

  clear: () => {
    // Special handling in terminal.js
    return '__CLEAR__';
  },
};

// Get list of available commands for suggestions
export const commandList = Object.keys(commands);

// Execute a command and return the result
export function executeCommand(input) {
  const trimmed = input.trim();

  // Remove leading slash if present
  const normalized = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;

  // Split into command and arguments
  const parts = normalized.split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  if (!cmd) {
    return '';
  }

  if (commands[cmd]) {
    return commands[cmd](args);
  }

  return `
<div class="output__line output__line--secondary">Command not found: ${cmd}</div>
<div class="output__line">Type <span class="output__line--accent">/help</span> for available commands.</div>
`;
}
