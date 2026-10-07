/**
 * Normalizes phone numbers to standard Jordanian format (07XXXXXXXX).
 * Handles inputs with or without country code (+962, 962) or missing leading 0.
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  let clean = raw.trim().replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+962')) {
    clean = '0' + clean.slice(4);
  } else if (clean.startsWith('962')) {
    clean = '0' + clean.slice(3);
  } else if (clean.startsWith('7') && clean.length === 9) {
    clean = '0' + clean;
  }
  return clean;
}
