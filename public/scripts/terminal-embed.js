// Whether this page is framed is knowable immediately. Deciding it in a
// deferred module painted the standalone return bar inside the drawer first,
// then removed it along with the 54px it occupied.
if (window.self !== window.top) document.documentElement.classList.add('terminal-embedded');
