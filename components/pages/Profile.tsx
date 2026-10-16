'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseCOP } from '@/lib/format';
import type { Profile as ProfileRow } from '@/lib/types';

type Tab = 'personal' | 'security' | 'notifications';

export default function Profile({ profile, email, verified }: { profile: ProfileRow; email: string; verified: boolean }) {
  const [tab, setTab] = useState<Tab>('personal');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fmtNum = (n: number | null | undefined) => (n ? new Intl.NumberFormat('es-CO').format(Number(n)) : '');
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    birth_date: profile.birth_date ?? '',
    gender: profile.gender ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    occupation: profile.occupation ?? 'Empleado',
    company: profile.company ?? '',
    contract_type: profile.contract_type ?? 'Término indefinido',
    monthly_income: fmtNum(profile.monthly_income),
  });
  const [notif, setNotif] = useState({
    notify_quota: profile.notify_quota,
    notify_payment: profile.notify_payment,
    notify_offers: profile.notify_offers,
  });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(v => ({ ...v, [k]: e.target.value })),
  });
  const initial = (profile.full_name || email || 'C').trim().charAt(0).toUpperCase();

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  const save = async () => {
    setError(''); setBusy(true);
    const supabase = createClient();
    if (tab === 'security') {
      if (pw.next.length < 8) { setBusy(false); setError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
      if (pw.next !== pw.confirm) { setBusy(false); setError('Las contraseñas nuevas no coinciden.'); return; }
      const { error: se } = await supabase.auth.signInWithPassword({ email, password: pw.current });
      if (se) { setBusy(false); setError('La contraseña actual no es correcta.'); return; }
      const { error: ue } = await supabase.auth.updateUser({ password: pw.next });
      setBusy(false);
      if (ue) { setError(ue.message); return; }
      setPw({ current: '', next: '', confirm: '' });
      flash('Contraseña actualizada correctamente.');
      return;
    }
    const patch = tab === 'notifications' ? notif : {
      full_name: form.full_name.trim(), birth_date: form.birth_date || null, gender: form.gender || null,
      phone: form.phone.trim(), address: form.address.trim(), occupation: form.occupation,
      company: form.company.trim(), contract_type: form.contract_type,
      monthly_income: parseCOP(form.monthly_income) || null,
    };
    const { error: pe } = await supabase.from('profiles').update(patch).eq('id', profile.id);
    setBusy(false);
    if (pe) { setError(pe.message); return; }
    flash('Cambios guardados correctamente.');
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400';
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-slate-900 text-2xl lg:text-3xl mb-1.5">Mi perfil</h1>
        <p className="text-slate-500">Administra tu información personal y preferencias.</p>
      </div>

      {error && <p role="alert" className="mb-5 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      {saved && (
        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="w-5 h-5 shrink-0">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-emerald-800 text-sm font-medium">{saved}</p>
        </div>
      )}

      {/* Avatar + tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 border-b border-slate-100">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-display font-700 text-2xl">{initial}</div>
          </div>
          <div>
            <p className="font-display font-700 text-slate-900 text-lg">{profile.full_name || 'Cliente'}</p>
            <p className="text-slate-500 text-sm">{email}{profile.client_code ? ` · ${profile.client_code}` : ''}</p>
            {verified && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Correo verificado
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-5">
          {([['personal', 'Información'], ['security', 'Seguridad'], ['notifications', 'Notificaciones']] as [Tab, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`py-3.5 px-4 text-sm font-medium border-b-2 -mb-px transition-all ${tab === id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {tab === 'personal' && (
          <div className="p-6 space-y-6">
            {/* Personal */}
            <div>
              <h3 className="font-display font-600 text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">Información personal</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre completo</label>
                  <input type="text" {...f('full_name')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Documento de identidad</label>
                  <input type="text" value={profile.document ?? ''} className={inputCls + ' bg-slate-50 text-slate-500'} readOnly />
                </div>
                <div>
                  <label className={labelCls}>Fecha de nacimiento</label>
                  <input type="date" {...f('birth_date')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Género</label>
                  <select className={inputCls + ' bg-white'} {...f('gender')}>
                    <option value="">Selecciona…</option>
                    <option>Masculino</option>
                    <option>Femenino</option>
                    <option>Prefiero no indicar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-display font-600 text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">Información de contacto</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Correo electrónico</label>
                  <input type="email" value={email} className={inputCls + ' bg-slate-50 text-slate-500'} readOnly />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="tel" {...f('phone')} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Dirección</label>
                  <input type="text" {...f('address')} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Labor */}
            <div>
              <h3 className="font-display font-600 text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">Información laboral</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ocupación</label>
                  <select className={inputCls + ' bg-white'} {...f('occupation')}>
                    <option>Empleado</option>
                    <option>Independiente</option>
                    <option>Pensionado</option>
                    <option>Estudiante</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Empresa</label>
                  <input type="text" {...f('company')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Ingresos mensuales</label>
                  <input type="text" inputMode="numeric" value={form.monthly_income} onChange={e => { const n = parseCOP(e.target.value); setForm(v => ({ ...v, monthly_income: n ? new Intl.NumberFormat('es-CO').format(n) : '' })); }} placeholder="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tipo de contrato</label>
                  <select className={inputCls + ' bg-white'} {...f('contract_type')}>
                    <option>Término indefinido</option>
                    <option>Término fijo</option>
                    <option>Prestación de servicios</option>
                    <option>Por obra</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-display font-600 text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">Cambiar contraseña</h3>
              <div className="max-w-sm space-y-4">
                <div>
                  <label className={labelCls}>Contraseña actual</label>
                  <input type="password" autoComplete="current-password" value={pw.current} onChange={e => setPw(v => ({ ...v, current: e.target.value }))} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Nueva contraseña</label>
                  <input type="password" autoComplete="new-password" value={pw.next} onChange={e => setPw(v => ({ ...v, next: e.target.value }))} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirmar nueva contraseña</label>
                  <input type="password" autoComplete="new-password" value={pw.confirm} onChange={e => setPw(v => ({ ...v, confirm: e.target.value }))} placeholder="••••••••" className={inputCls} />
                </div>
              </div>
            </div>

          </div>
        )}

        {tab === 'notifications' && (
          <div className="p-6">
            <h3 className="font-display font-600 text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">Preferencias de notificaciones</h3>
            <div className="space-y-3">
              {([
                { key: 'notify_quota', label: 'Recordatorio de cuota', desc: '3 días antes del vencimiento' },
                { key: 'notify_payment', label: 'Confirmación de pago', desc: 'Cuando se procesa un pago exitoso' },
                { key: 'notify_offers', label: 'Ofertas y promociones', desc: 'Nuevas ofertas de crédito disponibles' },
              ] as const).map(item => { const active = notif[item.key]; return (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button type="button" role="switch" aria-checked={active} aria-label={item.label}
                    onClick={() => setNotif(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-all ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              ); })}
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-2">
          <button onClick={save} disabled={busy} className="disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-sm">
            {busy ? 'Guardando…' : tab === 'security' ? 'Cambiar contraseña' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
