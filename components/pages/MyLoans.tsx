'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { balanceAfter } from '@/lib/loan';
import type { Loan } from '@/lib/types';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: 'Activo', cls: 'text-blue-700 bg-blue-50 border border-blue-100' },
  paid: { label: 'Pagado', cls: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
  review: { label: 'En revisión', cls: 'text-amber-700 bg-amber-50 border border-amber-100' },
  rejected: { label: 'Rechazado', cls: 'text-red-700 bg-red-50 border border-red-100' },
};

function toView(l: Loan) {
  return {
    id: l.code,
    date: formatDate(l.created_at),
    amount: Number(l.amount),
    quotas: l.months,
    nextPayment: formatDate(l.next_payment),
    status: l.status as string,
    balance: l.status === 'paid' ? 0 : l.status === 'rejected' ? 0 : balanceAfter(l, l.paid_quotas),
    interest: Number(l.interest_total),
    paidQ: l.paid_quotas,
    totalQ: l.months,
  };
}

export default function MyLoans({ rows }: { rows: Loan[] }) {
  const loans = rows.map(toView);
  const [selected, setSelected] = useState<ReturnType<typeof toView> | null>(loans[0] ?? null);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-slate-900 text-2xl lg:text-3xl mb-1.5">Mis préstamos</h1>
        <p className="text-slate-500">Historial y estado de todos tus créditos.</p>
      </div>

      {loans.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm mb-5">
          <p className="text-slate-500 text-sm mb-4">Aún no tienes préstamos ni solicitudes.</p>
          <Link href="/solicitar" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm">
            Solicitar mi primer préstamo
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-display font-600 text-slate-900">Todos los préstamos</h2>
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">{loans.length} registros</span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['ID Préstamo', 'Fecha', 'Monto', 'Cuotas', 'Próximo pago', 'Estado'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map(loan => {
                    const s = statusConfig[loan.status];
                    const isSelected = selected?.id === loan.id;
                    return (
                      <tr
                        key={loan.id}
                        onClick={() => setSelected(loan)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-slate-700 font-medium">{loan.id}</span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{loan.date}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">{formatCOP(loan.amount)}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{loan.paidQ}/{loan.totalQ}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{loan.nextPayment}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {loans.map(loan => {
                const s = statusConfig[loan.status];
                return (
                  <div
                    key={loan.id}
                    onClick={() => setSelected(loan)}
                    className={`p-4 cursor-pointer ${selected?.id === loan.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-slate-700">{loan.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">{formatCOP(loan.amount)}</span>
                      <span className="text-slate-500 text-sm">{loan.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div>
          {selected ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-display font-600 text-slate-900 text-sm">Detalle del préstamo</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[selected.status].cls}`}>
                  {statusConfig[selected.status].label}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <p className="text-slate-500 text-xs mb-0.5">Monto original</p>
                  <p className="font-display font-700 text-slate-900 text-2xl">{formatCOP(selected.amount)}</p>
                  <p className="font-mono text-xs text-slate-400 mt-1">{selected.id}</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    ['Saldo pendiente', formatCOP(selected.balance), selected.balance > 0 ? 'text-slate-900' : 'text-emerald-600'],
                    ['Intereses totales', formatCOP(selected.interest), 'text-slate-700'],
                    ['Cuotas pagadas', `${selected.paidQ} de ${selected.totalQ}`, 'text-slate-700'],
                    ['Cuotas restantes', `${selected.totalQ - selected.paidQ}`, 'text-slate-700'],
                    ['Próxima fecha', selected.nextPayment, 'text-slate-700'],
                  ].map(([k, v, cls]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500 text-sm">{k}</span>
                      <span className={`text-sm font-medium ${cls}`}>{v}</span>
                    </div>
                  ))}
                </div>

                {selected.totalQ > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Progreso</span>
                      <span>{Math.round((selected.paidQ / selected.totalQ) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${(selected.paidQ / selected.totalQ) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {selected.status === 'active' && (
                  <Link href="/pagos" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-all mt-2">
                    Realizar pago
                  </Link>
                )}
                {selected.status === 'paid' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-emerald-700 text-sm font-semibold">✓ Préstamo totalmente pagado</p>
                  </div>
                )}
                {selected.status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-red-700 text-sm font-semibold">Solicitud rechazada</p>
                  </div>
                )}
                {selected.status === 'review' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-amber-700 text-sm font-semibold">Solicitud en evaluación</p>
                    <p className="text-amber-600 text-xs mt-0.5">Respuesta en 24-48 horas</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
              <p className="text-slate-400 text-sm">Selecciona un préstamo para ver el detalle</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
