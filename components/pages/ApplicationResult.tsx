'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatCOP, formatDate } from '@/lib/format';
import type { Loan } from '@/lib/types';

export default function ApplicationResult({ loan }: { loan: Loan }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(loan.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const timeline = [
    { label: 'Solicitud enviada', done: true },
    { label: 'Información recibida', done: true },
    { label: 'Evaluación de crédito', active: true },
    { label: 'Decisión', done: false },
    { label: 'Desembolso', done: false },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-8 h-8">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display font-700 text-white text-2xl mb-1.5">Solicitud recibida</h1>
          <p className="text-blue-100 text-sm">Tu solicitud está siendo procesada por nuestro equipo.</p>
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full mt-4">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            En revisión
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Application number */}
          <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs">Número de solicitud</p>
              <p className="font-display font-700 text-slate-900 text-lg mt-0.5">{loan.code}</p>
            </div>
            <button onClick={copy} className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          {/* Details */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <p className="text-sm font-semibold text-slate-700">Detalles de la solicitud</p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                ['Monto solicitado', formatCOP(loan.amount)],
                ['Plazo', `${loan.months} meses`],
                ['Cuota estimada', formatCOP(loan.quota_amount)],
                ['Fecha de solicitud', formatDate(loan.created_at)],
                ['Estado actual', 'En revisión'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-3">
                  <span className="text-slate-500 text-sm">{k}</span>
                  <span className={`text-sm font-medium ${k === 'Estado actual' ? 'text-amber-600' : 'text-slate-900'}`}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="font-display font-600 text-slate-900 text-sm mb-4">Estado del proceso</p>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10
                      ${item.done ? 'bg-emerald-500' : (item as any).active ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-100'}
                    `}>
                      {item.done
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        : (item as any).active
                          ? <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          : <span className="w-2 h-2 bg-slate-300 rounded-full" />
                      }
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 h-8 ${item.done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  <div className="pb-8 pt-1">
                    <p className={`text-sm font-medium ${item.done ? 'text-emerald-700' : (item as any).active ? 'text-blue-700' : 'text-slate-400'}`}>
                      {item.label}
                    </p>
                    {item.done && <p className="text-xs text-slate-400 mt-0.5">Completado</p>}
                    {(item as any).active && <p className="text-xs text-blue-500 mt-0.5">En proceso...</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" className="w-5 h-5 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            <p className="text-blue-700 text-sm leading-relaxed">
              Te notificaremos por correo y SMS cuando tengamos novedades sobre tu solicitud. El proceso de evaluación toma entre <strong>24 y 48 horas hábiles</strong>.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
