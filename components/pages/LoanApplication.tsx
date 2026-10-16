'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { parseCOP } from '@/lib/format';
import type { Profile } from '@/lib/types';

interface LoanApplicationProps {
  userId: string;
  profile: Profile;
  initial: { amount: number; months: number; purpose: string };
}

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

const steps = [
  { n: 1, label: 'Información' },
  { n: 2, label: 'Empleo' },
  { n: 3, label: 'Préstamo' },
  { n: 4, label: 'Confirmación' },
];

export default function LoanApplication({ userId, profile, initial }: LoanApplicationProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fmtNum = (n: number | null | undefined) => (n ? new Intl.NumberFormat('es-CO').format(Number(n)) : '');
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    document: profile.document ?? '',
    birth_date: profile.birth_date ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    occupation: profile.occupation ?? 'Empleado',
    company: profile.company ?? '',
    contract_type: profile.contract_type ?? 'Término indefinido',
    monthly_income: fmtNum(profile.monthly_income),
    monthly_expenses: fmtNum(profile.monthly_expenses),
    amount: String(initial.amount),
    months: String(initial.months),
    purpose: initial.purpose,
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set(k, e.target.value) });
  const fm = (k: 'monthly_income' | 'monthly_expenses') => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { const n = parseCOP(e.target.value); set(k, n ? new Intl.NumberFormat('es-CO').format(n) : ''); },
  });

  const amount = Number(form.amount);
  const months = Number(form.months);
  const rate = 1.8;
  const monthlyRate = rate / 100;
  const quota = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const amountOptions = Array.from(new Set([2000000, 4000000, 6000000, 8000000, 10000000, 15000000, 20000000, amount])).sort((a, b) => a - b);
  const monthOptions = Array.from(new Set([6, 12, 18, 24, 36, 48, 60, months])).sort((a, b) => a - b);

  const sections = [
    { title: 'Información personal', items: [['Nombre', form.full_name], ['Documento', form.document], ['Teléfono', form.phone], ['Dirección', form.address]] },
    { title: 'Información laboral', items: [['Ocupación', form.occupation], ['Empresa', form.company], ['Ingresos', `$${form.monthly_income}/mes`], ['Gastos', `$${form.monthly_expenses || 0}/mes`]] },
    { title: 'Préstamo', items: [['Monto', formatCOP(amount)], ['Plazo', `${months} meses`], ['Cuota estimada', formatCOP(quota)], ['Motivo', form.purpose]] },
  ];

  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5';
  const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400';
  const selectCls = inputCls + ' bg-white';

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.full_name.trim()) e.full_name = 'Ingresa tu nombre completo.';
      if (!form.document.trim()) e.document = 'Ingresa tu documento de identidad.';
      if (!form.birth_date) e.birth_date = 'Ingresa tu fecha de nacimiento.';
      else if ((Date.now() - new Date(form.birth_date).getTime()) / 31557600000 < 18) e.birth_date = 'Debes ser mayor de 18 años.';
      if (!form.phone.trim()) e.phone = 'Ingresa tu teléfono.';
      if (!form.address.trim()) e.address = 'Ingresa tu dirección de residencia.';
    }
    if (step === 2) {
      const inc = parseCOP(form.monthly_income);
      if (!form.company.trim()) e.company = 'Ingresa el nombre de tu empresa.';
      if (inc <= 0) e.monthly_income = 'Ingresa tus ingresos mensuales.';
      if (!form.monthly_expenses.trim()) e.monthly_expenses = 'Ingresa tus gastos mensuales (puede ser 0).';
      else if (parseCOP(form.monthly_expenses) >= inc && inc > 0) e.monthly_expenses = 'Tus gastos no pueden ser mayores o iguales a tus ingresos.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    setSaving(true); setSubmitError('');
    const supabase = createClient();
    const { error: pe } = await supabase.from('profiles').update({
      full_name: form.full_name.trim(), document: form.document.trim(), phone: form.phone.trim(),
      birth_date: form.birth_date, address: form.address.trim(), occupation: form.occupation,
      company: form.company.trim(), contract_type: form.contract_type,
      monthly_income: parseCOP(form.monthly_income), monthly_expenses: parseCOP(form.monthly_expenses),
    }).eq('id', userId);
    if (pe) { setSaving(false); setSubmitError('No pudimos guardar tus datos: ' + pe.message); return; }

    const { data, error } = await supabase.from('loans').insert({
      user_id: userId, amount, months, purpose: form.purpose, loan_type: form.purpose,
    }).select('id').single();
    if (error || !data) { setSaving(false); setSubmitError('No pudimos enviar tu solicitud: ' + (error?.message ?? 'error desconocido')); return; }
    router.push(`/solicitar/resultado?id=${data.id}`);
  };

  const next = () => {
    if (step === 4) { submit(); return; }
    if (validate()) setStep(s => s + 1);
  };

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-slate-900 text-2xl lg:text-3xl mb-1.5">Solicitar préstamo</h1>
        <p className="text-slate-500">Completa la información en 4 pasos simples.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${step > s.n ? 'bg-emerald-500 text-white' : step === s.n ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {step > s.n
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : s.n
                }
              </div>
              <span className={`text-xs mt-1.5 font-medium hidden sm:block ${step === s.n ? 'text-blue-600' : step > s.n ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all ${step > s.n ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paso {step} de 4</p>
          <h2 className="font-display font-700 text-slate-900 text-lg mt-0.5">
            {step === 1 && 'Información personal'}
            {step === 2 && 'Información laboral'}
            {step === 3 && 'Detalles del préstamo'}
            {step === 4 && 'Revisa y confirma'}
          </h2>
        </div>

        <div className="p-6">
          {(Object.values(errors).length > 0 || submitError) && (
            <p role="alert" className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {submitError || Object.values(errors)[0]}
            </p>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre completo *</label>
                  <input type="text" {...f('full_name')} className={inputCls} placeholder="Nombre completo" />
                </div>
                <div>
                  <label className={labelCls}>Documento de identidad *</label>
                  <input type="text" {...f('document')} className={inputCls} placeholder="CC/NIT/Pasaporte" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha de nacimiento *</label>
                  <input type="date" {...f('birth_date')} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono *</label>
                  <input type="tel" {...f('phone')} className={inputCls} placeholder="300 000 0000" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Dirección de residencia *</label>
                <input type="text" {...f('address')} className={inputCls} placeholder="Calle, número, ciudad" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ocupación *</label>
                  <select className={selectCls} {...f('occupation')}>
                    <option>Empleado</option>
                    <option>Independiente</option>
                    <option>Pensionado</option>
                    <option>Estudiante</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Empresa *</label>
                  <input type="text" {...f('company')} className={inputCls} placeholder="Nombre de la empresa" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Tipo de contrato *</label>
                <select className={selectCls} {...f('contract_type')}>
                  <option>Término indefinido</option>
                  <option>Término fijo</option>
                  <option>Prestación de servicios</option>
                  <option>Por obra</option>
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ingresos mensuales *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="text" inputMode="numeric" {...fm('monthly_income')} placeholder="0" className={inputCls + ' pl-7'} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Gastos mensuales *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input type="text" inputMode="numeric" {...fm('monthly_expenses')} placeholder="0" className={inputCls + ' pl-7'} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Monto solicitado *</label>
                <select className={selectCls} {...f('amount')}>
                  {amountOptions.map(v => (
                    <option key={v} value={v}>{formatCOP(v)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Plazo *</label>
                <select className={selectCls} {...f('months')}>
                  {monthOptions.map(v => (
                    <option key={v} value={v}>{v} meses</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Motivo del préstamo *</label>
                <select className={selectCls} {...f('purpose')}>
                  <option>Libre inversión</option>
                  <option>Educación</option>
                  <option>Salud</option>
                  <option>Vivienda</option>
                  <option>Negocio / Emprendimiento</option>
                  <option>Vehículo</option>
                  <option>Viajes</option>
                </select>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-semibold text-blue-800 mb-2">Resumen estimado</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-blue-600 font-display font-700 text-lg">{formatCOP(amount)}</p>
                    <p className="text-blue-500 text-xs">Monto</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-display font-700 text-lg">{months}m</p>
                    <p className="text-blue-500 text-xs">Plazo</p>
                  </div>
                  <div>
                    <p className="text-blue-600 font-display font-700 text-lg">{formatCOP(quota)}</p>
                    <p className="text-blue-500 text-xs">Cuota aprox.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" className="w-5 h-5 shrink-0 mt-0.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                  <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-emerald-800 font-semibold text-sm">Casi listo</p>
                  <p className="text-emerald-600 text-xs mt-0.5">Revisa que tus datos sean correctos. La aprobación está sujeta a evaluación crediticia.</p>
                </div>
              </div>

              {sections.map(section => (
                <div key={section.title} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-700">{section.title}</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {section.items.map(([k, v]) => (
                      <div key={k} className="flex justify-between px-4 py-2.5">
                        <span className="text-slate-500 text-sm">{k}</span>
                        <span className="text-slate-900 text-sm font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between gap-3">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : undefined}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all ${step === 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
            disabled={step === 1}
          >
            Anterior
          </button>
          <button
            onClick={next}
            disabled={saving}
            className="disabled:opacity-60 px-6 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center gap-2"
          >
            {step === 4 ? (saving ? 'Enviando…' : 'Enviar solicitud') : 'Continuar'}
            {step < 4 && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
