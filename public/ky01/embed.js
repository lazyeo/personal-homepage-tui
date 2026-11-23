// Whether this is an embed is knowable from the URL immediately. Leaving it to
// the module script painted the header, the intro and the screenshot rail
// first, then removed them.
if (new URLSearchParams(location.search).has('embed'))
  document.body.className = (document.body.className + ' embed').trim();
