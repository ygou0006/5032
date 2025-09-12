export function sanitizeString(s) {
  if (typeof s !== 'string') return ''
  return s.replace(
    /[&<>"'`=\/]/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
      })[c] || c,
  )
}
