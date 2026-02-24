/**
 * Escapes HTML special characters to prevent XSS when interpolating
 * into innerHTML/template literals that produce HTML.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
}
