// Loaded as a classic, parser-blocking script right after the logo markup,
// so document.currentScript still finds it. External so the CSP can forbid
// inline script.
// The block logo is drawn from seven box and block characters. The
// self-hosted JetBrains Mono carries them; if it fails to arrive, each character is substituted from whatever the
// platform has and rows of differing advance skew the letters, so verify
// before using it: do all six rows render to the same width? That tests the
// condition directly, unlike viewport width, which cannot tell a 480px phone
// from a 635px drawer on a 1440px desktop.
(function () {
  var header = document.currentScript.previousElementSibling;
  if (!header || !header.hasAttribute('data-ascii-header')) {
    header = document.querySelector('[data-ascii-header]');
  }
  var block = header && header.querySelector('.ascii-logo--desktop');
  if (!block) return;

  var rows = block.textContent.split('\n').filter(function (row) {
    return row.length > 0;
  });

  function aligned() {
    var probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
      'position:absolute;left:-9999px;top:0;visibility:hidden;white-space:pre;font-size:40px;font-family:' +
      getComputedStyle(block).fontFamily;
    document.body.append(probe);
    var widths = rows.map(function (row) {
      probe.textContent = row;
      return probe.getBoundingClientRect().width;
    });
    probe.remove();
    // Measured at 40px, so half a pixel across a 43-column row stays far
    // under one rendered pixel at the sizes the logo is displayed at.
    return (
      rows.length > 1 &&
      Math.max.apply(null, widths) - Math.min.apply(null, widths) < 0.5
    );
  }

  function settle() {
    if (aligned()) header.dataset.blocks = 'aligned';
    delete header.dataset.deciding;
  }

  // Check once during parsing: a platform whose own font already carries the
  // glyphs settles immediately, with nothing hidden. Otherwise stay blank
  // until the box-drawing face resolves, rather than showing the wrong logo.
  header.dataset.deciding = '';
  if (aligned()) {
    settle();
  } else if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(settle);
  } else {
    settle();
  }
})();
