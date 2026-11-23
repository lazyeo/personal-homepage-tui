// Restore the terminal theme chosen earlier, defaulting to gruvbox.
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'gruvbox');
