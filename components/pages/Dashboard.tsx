'use client';

import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCOP, formatDate } from '@/lib/format';
import { daysUntil, nextQuotaSplit, balanceAfter } from '@/lib/loan';
import type { Loan, Payment, Profile } from '@/lib/types';

interface DashboardProps {
  profile: Pick<Profile, 'full_name' | 'client_code' | 'credit_limit' | 'created_at'>;
  activeLoan: Loan | null;
  activeCount: number;
  reviewCount: number;
  payments: Payment[];
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatM(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

function lastMonthsData(payments: Payment[], n = 9) {
  const now = new Date();
  const buckets = Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, mes: MESES[d.getMonth()], pagado: 0 };
  });
  payments.filter(p => p.status === 'Exitoso').forEach(p => {
    const d = new Date(p.created_at);
    const b = buckets.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (b) b.pagado += Number(p.amount);
  });
  return buckets;
}

export default function Dashboard({ profile, activeLoan, activeCount, reviewCount, payments }: DashboardProps) {
  const firstName = (profile.full_name || 'cliente').split(' ')[0];
  const since = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date(profile.created_at));
  const chart = lastMonthsData(payments);
  const totalPaid = chart.reduce((s, b) => s + b.pagado, 0);

  const loan = activeLoan;
  const days = loan ? daysUntil(loan.next_payment) : null;
  const split = loan ? nextQuotaSplit(loan) : null;
  const balance = loan ? balanceAfter(loan, loan.paid_quotas) : 0;
  const pct = loan ? Math.round((loan.paid_quotas / loan.months) * 100) : 0;
  const overdue = days !== null && days < 0;

  const cards = [
    {
      label: 'Crédito disponible',
      value: formatCOP(profile.credit_limit),
      sub: 'Cupo preaprobado',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" className="w-5 h-5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      trend: null as string | null,
      trendUp: false as boolean | null,
    },
    {
      label: 'Préstamo actual',
      value: loan ? formatCOP(loan.amount) : '—',
      sub: loan ? loan.code : reviewCount ? `${reviewCount} solicitud(es) en revisión` : 'Sin préstamos activos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" className="w-5 h-5">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-blue-50',
      trend: loan ? 'Activo' : null,
      trendUp: loan ? true : false,
    },
    {
      label: 'Próxima cuota',
      value: loan ? formatCOP(loan.quota_amount) : '—',
      sub: loan ? `${formatDate(loan.next_payment)}${days !== null ? ` · ${days} días` : ''}` : 'Nada pendiente',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.75" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      trend: days !== null ? (overdue ? 'Vencida' : `${days} días`) : null,
      trendUp: days !== null ? null : false,
    },
    {
      label: 'Saldo pendiente',
      value: loan ? formatCOP(balance) : '—',
      sub: loan ? `${loan.months - loan.paid_quotas} cuotas restantes` : '—',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.75" className="w-5 h-5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      iconBg: 'bg-emerald-50',
      trend: loan ? `${pct}% pagado` : null,
      trendUp: loan ? true : false,
    },
  ];

  const activity = payments.slice(0, 5);

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 lg:p-7 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-700 text-2xl lg:text-3xl mb-1">Hola, {firstName} 👋</h1>
            <p className="text-blue-100 text-sm lg:text-base">Consulta tu estado financiero y administra tus préstamos.</p>
          </div>
          <div className="shrink-0 hidden sm:block">
            <div className="text-right">
              <p className="text-blue-200 text-xs mb-0.5">Desde</p>
              <p className="text-white font-semibold text-sm capitalize">{since}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6 pt-5 border-t border-blue-500/40">
          <div>
            <p className="text-blue-200 text-xs">ID cliente</p>
            <p className="text-white font-medium text-sm mt-0.5">{profile.client_code ?? '—'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">Préstamos activos</p>
            <p className="text-white font-medium text-sm mt-0.5">{activeCount} activo{activeCount === 1 ? '' : 's'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs">En revisión</p>
            <p className="text-white font-medium text-sm mt-0.5">{reviewCount}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${card.iconBg} rounded-lg flex items-center justify-center`}>{card.icon}</div>
              {card.trend && card.trendUp === true && (
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{card.trend}</span>
              )}
              {card.trend && card.trendUp === null && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${overdue ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'}`}>{card.trend}</span>
              )}
            </div>
            <p className="font-display font-700 text-slate-900 text-lg lg:text-xl leading-none mb-1">{card.value}</p>
            <p className="text-slate-500 text-xs">{card.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts + Next payment */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-600 text-slate-900 text-base">Resumen de pagos</h2>
              <p className="text-slate-500 text-xs mt-0.5">Pagos realizados últimos 9 meses</p>
            </div>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {formatCOP(totalPaid)} total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatM(v)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                formatter={(v) => [formatCOP(Number(v)), 'Pagado']}
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                cursor={{ fill: '#eff6ff' }}
              />
              <Bar dataKey="pagado" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Next payment */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col">
          <h2 className="font-display font-600 text-slate-900 text-base mb-4">Próximo pago</h2>

          {loan && split ? (
            <>
              <div className="flex-1 space-y-4">
                <div className={`text-center py-4 rounded-xl ${overdue ? 'bg-red-50' : 'bg-amber-50'}`}>
                  <p className={`${overdue ? 'text-red-600' : 'text-amber-600'} text-xs font-medium mb-1`}>{overdue ? 'Vencida hace' : 'Vence en'}</p>
                  <p className={`font-display font-700 ${overdue ? 'text-red-700' : 'text-amber-700'} text-4xl`}>{days === null ? '—' : Math.abs(days)}</p>
                  <p className={`${overdue ? 'text-red-600' : 'text-amber-600'} text-xs mt-1`}>días · {formatDate(loan.next_payment)}</p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Valor cuota</span>
                    <span className="font-semibold text-slate-900 text-sm">{formatCOP(loan.quota_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Capital</span>
                    <span className="font-medium text-slate-700 text-sm">{formatCOP(split.capital)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Intereses</span>
                    <span className="font-medium text-slate-700 text-sm">{formatCOP(split.interest)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Progreso del préstamo</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>{loan.paid_quotas} cuotas pagadas</span>
                    <span>{loan.months - loan.paid_quotas} restantes</span>
                  </div>
                </div>
              </div>

              <Link href="/pagos" className="mt-4 w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl transition-all shadow-sm">
                Realizar pago
              </Link>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
              <p className="text-slate-500 text-sm">
                {reviewCount
                  ? 'Tu solicitud está en revisión. Te avisaremos cuando sea aprobada.'
                  : 'Aún no tienes un préstamo activo.'}
              </p>
              <Link href="/solicitar" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm">
                Solicitar préstamo
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-display font-600 text-slate-900 text-base">Actividad reciente</h2>
          <Link href="/pagos" className="text-blue-600 text-sm font-medium hover:text-blue-700">Ver todo</Link>
        </div>
        {activity.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Todavía no tienes pagos registrados.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activity.map(a => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-4 h-4"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Cuota {a.quota_number} pagada</p>
                    <p className="text-xs text-slate-400">{formatDate(a.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">-{formatCOP(a.amount)}</p>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Solicitar préstamo', href: '/solicitar', icon: '➕', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
          { label: 'Simulador', href: '/simulador', icon: '📊', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
          { label: 'Mis préstamos', href: '/prestamos', icon: '📋', color: 'text-slate-600 bg-slate-50 hover:bg-slate-100' },
          { label: 'Pagos', href: '/pagos', icon: '💳', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
        ].map(a => (
          <Link key={a.label} href={a.href} className={`${a.color} rounded-xl p-4 text-center transition-all`}>
            <div className="text-2xl mb-2">{a.icon}</div>
            <p className="text-sm font-semibold">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
