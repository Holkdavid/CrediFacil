export function formatCOP(n: number | string | null | undefined) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(Number(n ?? 0));
}

export function formatDate(d: string | Date | null | undefined) {
  if (!d) return '—';
  const date = typeof d === 'string' && d.length === 10 ? new Date(d + 'T12:00:00') : new Date(d);
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(date).replace(/\./g, '');
}

/** Cuota fija (sistema francés). rate = % mensual. */
export function calcQuota(amount: number, months: number, rate = 1.8) {
  const r = rate / 100;
  return Math.round((amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

/** "4.500.000" -> 4500000 */
export function parseCOP(s: string) {
  return Number(String(s).replace(/[^\d]/g, '')) || 0;
}
