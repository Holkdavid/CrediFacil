'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/format';
import { daysUntil, nextQuotaSplit } from '@/lib/loan';
import type { Loan, Payment } from '@/lib/types';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Payments({ loan, history }: { loan: Loan | null; history: Payment[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const quotaNo = loan ? loan.paid_quotas + 1 : 0;
  const days = loan ? daysUntil(loan.next_payment) : null;
  const split = loan ? nextQuotaSplit(loan) : { capital: 0, interest: 0, balance: 0 };
  const [method, setMethod] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paid, setPaid] = useState(false);

  const methods = [
    { id: 'pse', label: 'PSE', desc: 'Débito en línea', icon: '🏦' },
    { id: 'card', label: 'Débito / Crédito', desc: 'Todas las franquicias', icon: '💳' },
    { id: 'transfer', label: 'Transferencia', desc: 'A cuenta CrediFácil', icon: '🔄' },
  ];

  const doPay = async () => {
    if (!loan || !method) return;
    setBusy(true); setError('');
    const label = methods.find(m => m.id === method)?.label ?? method;
    const { error } = await createClient().rpc('pay_next_quota', { p_loan_id: loan.id, p_method: label });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setShowModal(false);
    setPaid(true);
    setMethod(null);
    router.refresh();
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-slate-900 text-2xl lg:text-3xl mb-1.5">Pagos</h1>
        <p className="text-slate-500">Administra tus pagos y consulta tu historial.</p>
      </div>

      {paid && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-emerald-800 font-semibold text-sm">¡Pago realizado exitosamente!</p>
            <p className="text-emerald-600 text-xs mt-0.5">Tu cuota fue procesada. Recibirás un comprobante en tu correo.</p>
          </div>
          <button onClick={() => setPaid(false)} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Payment form */}
        <div className="lg:col-span-1 space-y-4">
          {/* Next quota */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-display font-600 text-slate-900 mb-4">Próxima cuota</h2>
            {!loan ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm mb-4">No tienes cuotas pendientes por pagar.</p>
                <Link href="/solicitar" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">Solicitar préstamo</Link>
              </div>
            ) : (<>
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500 text-sm">Cuota {quotaNo} de {loan.months}</span>
                <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded-full">{days === null ? '—' : `${days} días`}</span>
              </div>
              <p className="font-display font-700 text-slate-900 text-2xl">{formatCOP(loan.quota_amount)}</p>
              <p className="text-slate-400 text-xs mt-1">Vence el {formatDate(loan.next_payment)}</p>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Capital</span>
                <span className="text-slate-700 font-medium">{formatCOP(split.capital)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intereses</span>
                <span className="text-slate-700 font-medium">{formatCOP(split.interest)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-700 font-semibold">Total</span>
                <span className="text-slate-900 font-semibold">{formatCOP(loan.quota_amount)}</span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-3">Método de pago</h3>
            <div className="space-y-2">
              {methods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${method === m.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-xl">{m.icon}</span>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${method === m.id ? 'text-blue-700' : 'text-slate-800'}`}>{m.label}</p>
                    <p className="text-xs text-slate-400">{m.desc}</p>
                  </div>
                  {method === m.id && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => method && setShowModal(true)}
              disabled={!method}
              className={`w-full mt-4 font-semibold text-sm py-3.5 rounded-xl transition-all ${method ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              Pagar ahora
            </button>
            </>)}
          </div>
        </div>

        {/* History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-600 text-slate-900">Historial de pagos</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{history.length} pagos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Referencia', 'Fecha', 'Cuota', 'Monto', 'Método', 'Estado'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-600">{p.code}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{formatDate(p.created_at)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">#{p.quota_number}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{p.amount > 0 ? formatCOP(p.amount) : '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{p.method}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status === 'Exitoso' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Aún no tienes pagos registrados.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && loan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-display font-700 text-slate-900">Confirmar pago</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p className="text-slate-500 text-sm">Revisa los detalles antes de continuar.</p>
            </div>
            <div className="p-6 space-y-3">
              {[
                ['Cuota', `#${quotaNo} de ${loan.months}`],
                ['Monto', formatCOP(loan.quota_amount)],
                ['Método', methods.find(m => m.id === method)?.label || ''],
                ['Fecha', formatDate(new Date())],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-slate-500 text-sm">{k}</span>
                  <span className="font-medium text-slate-900 text-sm">{v}</span>
                </div>
              ))}
            </div>
            {error && <p role="alert" className="mx-6 mb-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>}
            <p className="px-6 text-xs text-slate-400">Entorno de demostración: el pago se registra sin pasar por una pasarela real.</p>
            <div className="p-6 pt-2 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-700 font-medium text-sm py-3 rounded-xl hover:bg-slate-50 transition-all">
                Cancelar
              </button>
              <button onClick={doPay} disabled={busy} className="flex-1 disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-all">
                {busy ? 'Procesando…' : 'Confirmar pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
