// ═══════════════════════════════════════════════════════════════
// COMMAND HANDLERS
// Each command returns HTML string to be rendered in output
// ═══════════════════════════════════════════════════════════════

export const commands = {
  help: () => `
<div class="output__section">AVAILABLE COMMANDS</div>
<div class="output__line"><span class="cmd-link" data-cmd="/help">/help</span>      - Show this help message</div>
<div class="output__line"><span class="cmd-link" data-cmd="/about">/about</span>     - About me, experience & education</div>
<div class="output__line"><span class="cmd-link" data-cmd="/skills">/skills</span>    - Technical skills & tools</div>
<div class="output__line"><span class="cmd-link" data-cmd="/projects">/projects</span>  - Featured projects</div>
<div class="output__line"><span class="cmd-link" data-cmd="/contact">/contact</span>   - Get in touch</div>
<div class="output__line"><span class="cmd-link" data-cmd="/clear">/clear</span>     - Clear terminal</div>
`,

  about: () => `
<div class="output__section">ABOUT ME</div>
<div class="output__line">Hi! I'm <span class="output__line--accent">Shaun (Shun Zhang)</span>, a Product-Minded Vibe Coder based in Christchurch, New Zealand.</div>
<div class="output__line output__line--muted"></div>
<div class="output__line">A versatile technical professional combining full-stack development skills with extensive product management experience. I build things that matter — bridging technical and business needs to create software users actually love.</div>

<div class="output__section">EXPERIENCE</div>
<div class="ascii-box">
  <div class="ascii-box__header">[ Product Director · 2022-2024 ]</div>
  <div class="output__line">Nanjing Yilisha Technology Co., Ltd.</div>
  <div class="output__line output__line--secondary">Led EdgeMatrix distributed computing network for AI applications.</div>
  <div class="output__line output__line--secondary">Stakeholder analysis, requirement gathering, cross-functional coordination.</div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Independent Developer · 2017-2022 ]</div>
  <div class="output__line">Self-directed Learning & Community Building</div>
  <div class="output__line output__line--secondary">Built GameMaker community of ~1000 developers, created 50+ tutorials.</div>
  <div class="output__line output__line--secondary">"Signal" - 2nd Place, Microsoft ID@Xbox Dream Campus Tour</div>
  <div class="output__line output__line--secondary">"Swing & Crash" - Best Student Game, Giant 48h Game Jam</div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Senior Product Manager · 2008-2017 ]</div>
  <div class="output__line">Multiple Internet Startups (China)</div>
  <div class="output__line output__line--secondary">Led product teams across e-commerce, sports tech, mobile platforms.</div>
  <div class="output__line output__line--secondary">Managed teams up to 7 members for C-end and B-end products.</div>
</div>

<div class="output__section">EDUCATION</div>
<div class="output__line"><span class="output__line--accent">Master of Applied Computing</span> · Lincoln University, NZ (Completed 2025)</div>
<div class="output__line output__line--secondary">Python, Business Analysis, User Experience, Machine Learning</div>
<div class="output__line output__line--muted"></div>
<div class="output__line"><span class="output__line--accent">Bachelor of Biological Sciences</span> · Nanjing Forestry University (2004-2008)</div>
`,

  skills: () => `
<div class="output__section">TECHNICAL SKILLS</div>

<div class="output__line output__line--accent">Web Development</div>
<div class="output__line">  Python Flask · MySQL · HTML/CSS · Git & Version Control</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Machine Learning & Data Science</div>
<div class="output__line">  Python · Jupyter Notebooks · Pandas · Scikit-learn · Feature Engineering</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Business Analysis</div>
<div class="output__line">  Requirements Gathering · Process Improvement · Stakeholder Management</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Technical Support & Documentation</div>
<div class="output__line">  API Documentation · Technical Troubleshooting · User Guides</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">AI Tools & Productivity</div>
<div class="output__line">  Claude Code · Cursor · GitHub Copilot · ChatGPT · Gemini</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Cloud & Infrastructure</div>
<div class="output__line">  AWS · Docker · Distributed Computing · Cloudflare · Vercel</div>
<div class="output__line output__line--muted"></div>

<div class="output__line output__line--accent">Languages</div>
<div class="output__line">  English (Fluent) · Mandarin Chinese (Native)</div>
`,

  projects: () => `
<div class="output__section">FEATURED PROJECTS</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Kids Worksheet Generator ]</div>
  <div class="output__line">Web app generating printable math worksheets & coloring pages.</div>
  <div class="output__line output__line--secondary">Built for my son's learning — includes AI-generated coloring pages.</div>
  <div class="output__line output__line--accent">→ <a href="https://kids.a-dobe.club/" target="_blank" rel="noopener">kids.a-dobe.club</a></div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ CareerMatch AI ]</div>
  <div class="output__line">AI agent analyzing job postings against your resume.</div>
  <div class="output__line output__line--secondary">Provides CV & cover letter recommendations. Chrome extension in development.</div>
  <div class="output__line output__line--accent">→ <a href="https://careermatch-ai-web-git-main-lazyeos-projects.vercel.app/" target="_blank" rel="noopener">careermatch-ai.vercel.app</a></div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ Smart Canvas - AI Flowchart Generator ]</div>
  <div class="output__line">AI-powered tool generating flowcharts through conversational interface.</div>
  <div class="output__line output__line--secondary">Currently in early development, iterating on core functionality.</div>
  <div class="output__line output__line--accent">→ <a href="https://smart-canvas-brown.vercel.app/" target="_blank" rel="noopener">smart-canvas-brown.vercel.app</a></div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ LCC Issue Tracker ]</div>
  <div class="output__line">Full-stack web app with Python Flask & MySQL for issue management.</div>
  <div class="output__line output__line--secondary">Three-tier role-based access control (Visitor/Helper/Admin).</div>
  <div class="output__line output__line--accent">→ <a href="https://github.com/Shun-Zhang-1163127/LCC_Issue_Tracker" target="_blank" rel="noopener">GitHub</a></div>
</div>

<div class="ascii-box">
  <div class="ascii-box__header">[ ML Lending Data Analysis ]</div>
  <div class="output__line">Machine learning project analyzing Lending Club data (2007-2018).</div>
  <div class="output__line output__line--secondary">Predictive models for loan risk assessment & feature engineering.</div>
  <div class="output__line output__line--accent">→ <a href="https://github.com/Shun-Zhang-1163127/1163127" target="_blank" rel="noopener">GitHub</a></div>
</div>

<div class="output__line output__line--muted"></div>
<div class="output__line">Run <span class="cmd-link" data-cmd="/contact">/contact</span> to discuss potential collaborations.</div>
`,

  contact: () => `
<div class="output__section">GET IN TOUCH</div>

<div class="output__line"><span class="output__line--accent">Email</span>     → <a href="mailto:shaun@a-dobe.club">shaun@a-dobe.club</a></div>
<div class="output__line"><span class="output__line--accent">GitHub</span>    → <a href="https://github.com/lazyeo" target="_blank" rel="noopener">github.com/lazyeo</a></div>
<div class="output__line"><span class="output__line--accent">LinkedIn</span>  → <a href="https://linkedin.com/in/shaun-nz/" target="_blank" rel="noopener">linkedin.com/in/shaun-nz</a></div>
<div class="output__line"><span class="output__line--accent">Location</span>  → Christchurch, New Zealand</div>

<div class="output__line output__line--muted"></div>
<div class="output__line">Open to opportunities in Software Development and Business/Product Analysis.</div>
<div class="output__line">Let's build something great together!</div>
`,

  // theme is handled silently, not listed in help
  theme: (args) => {
    const validThemes = ['gruvbox', 'frost', 'amber'];
    const theme = args?.[0]?.toLowerCase();

    if (!theme || !validThemes.includes(theme)) {
      return null;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    document.querySelectorAll('.theme-switcher__dot').forEach(dot => {
      const isActive = dot.getAttribute('data-theme-id') === theme;
      dot.setAttribute('data-active', isActive ? 'true' : 'false');
    });

    return null;
  },

  clear: () => {
    return '__CLEAR__';
  },

  // Hidden command: audio debug console
  console: () => {
    return '__CONSOLE__';
  },
};

// Commands shown in suggestions (exclude theme)
export const commandList = ['help', 'about', 'skills', 'projects', 'contact', 'clear'];

// Execute a command and return the result
export function executeCommand(input) {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  // If starts with '/', treat as command
  if (trimmed.startsWith('/')) {
    const normalized = trimmed.slice(1);
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

  // Otherwise, treat as AI question
  return '__AI__' + trimmed;
}
