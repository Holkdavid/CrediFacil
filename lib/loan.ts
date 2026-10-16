import type { Loan } from './types';

/** Saldo de capital después de pagar k cuotas (sistema francés). */
export function balanceAfter(loan: Pick<Loan, 'amount' | 'monthly_rate' | 'quota_amount'>, k: number) {
  const r = Number(loan.monthly_rate) / 100;
  const P = Number(loan.amount);
  const q = Number(loan.quota_amount);
  const bal = P * Math.pow(1 + r, k) - q * ((Math.pow(1 + r, k) - 1) / r);
  return Math.max(0, Math.round(bal));
}

/** Desglose de la siguiente cuota: intereses = saldo * tasa, capital = resto. */
export function nextQuotaSplit(loan: Loan) {
  const balance = balanceAfter(loan, loan.paid_quotas);
  const interest = Math.round(balance * (Number(loan.monthly_rate) / 100));
  const quota = Number(loan.quota_amount);
  return { balance, interest, capital: Math.max(0, quota - interest) };
}

export function daysUntil(date: string | null) {
  if (!date) return null;
  const target = new Date(date + 'T12:00:00').getTime();
  return Math.ceil((target - Date.now()) / 86_400_000);
}
