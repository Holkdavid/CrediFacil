'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

const loanTypes = ['Libre inversión', 'Educación', 'Vehículo', 'Vivienda', 'Negocio'];

export default function Simulator() {
  const [amount, setAmount] = useState(8000000);
  const [months, setMonths] = useState(18);
  const [type, setType] = useState('Libre inversión');

  const rate = 1.8;
  const monthlyRate = rate / 100;
  const quota = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const total = quota * months;
  const interests = total - amount;

  const sliderPct = (v: number, min: number, max: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-7">
        <h1 className="font-display font-700 text-slate-900 text-2xl lg:text-3xl mb-1.5">Simulador de préstamo</h1>
        <p className="text-slate-500">Ajusta los parámetros para encontrar la mejor opción para ti.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Controls */}
        <div className="lg:col-span-3 space-y-5">
          {/* Amount */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-600 text-slate-900">Monto del préstamo</h2>
              <span className="font-display font-700 text-blue-600 text-xl">{formatCOP(amount)}</span>
            </div>
            <input
              type="range" min={500000} max={50000000} step={500000} value={amount}
              onChange={e => setAmount(+e.target.value)}
              className="w-full mb-2"
              style={{ background: `linear-gradient(to right, #2563eb ${sliderPct(amount, 500000, 50000000)}%, #e2e8f0 ${sliderPct(amount, 500000, 50000000)}%)` }}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>$500.000</span>
              <span>$50.000.000</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[2000000, 5000000, 10000000, 20000000].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all ${amount === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}
                >
                  {v >= 1000000 ? `$${v / 1000000}M` : `$${v / 1000}K`}
                </button>
              ))}
            </div>
          </div>

          {/* Term */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-600 text-slate-900">Plazo</h2>
              <span className="font-display font-700 text-blue-600 text-xl">{months} meses</span>
            </div>
            <input
              type="range" min={3} max={60} step={3} value={months}
              onChange={e => setMonths(+e.target.value)}
              className="w-full mb-2"
              style={{ background: `linear-gradient(to right, #2563eb ${sliderPct(months, 3, 60)}%, #e2e8f0 ${sliderPct(months, 3, 60)}%)` }}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>3 meses</span>
              <span>60 meses</span>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {[6, 12, 18, 24, 36].map(v => (
                <button
                  key={v}
                  onClick={() => setMonths(v)}
                  className={`py-2 rounded-lg text-xs font-medium border transition-all ${months === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}
                >
                  {v}m
                </button>
              ))}
            </div>
          </div>

          {/* Loan type */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h2 className="font-display font-600 text-slate-900 mb-4">Tipo de crédito</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {loanTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result card */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f172a] rounded-2xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" className="w-4.5 h-4.5">
                  <path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" strokeLinecap="round" />
                  <rect x="9" y="4" width="6" height="5" rx="1" />
                  <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-white font-display font-600">Resumen</p>
                <p className="text-slate-400 text-xs">{type}</p>
              </div>
            </div>

            <div className="text-center py-5 mb-5 border-b border-white/10">
              <p className="text-slate-400 text-xs mb-1">Cuota mensual</p>
              <p className="font-display font-800 text-white text-4xl">{formatCOP(quota)}</p>
              <p className="text-slate-400 text-xs mt-1">por {months} meses</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { l: 'Monto solicitado', v: formatCOP(amount) },
                { l: 'Tasa de interés', v: `${rate}% mensual` },
                { l: 'N.º cuotas', v: `${months}` },
                { l: 'Total a pagar', v: formatCOP(total) },
                { l: 'Intereses totales', v: formatCOP(interests) },
              ].map(r => (
                <div key={r.l} className="flex justify-between">
                  <span className="text-slate-400 text-sm">{r.l}</span>
                  <span className="text-white text-sm font-medium">{r.v}</span>
                </div>
              ))}
            </div>

            {/* Interest bar */}
            <div className="mb-5 p-3 bg-white/5 rounded-xl">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-blue-400">Capital</span>
                <span className="text-amber-400">Intereses</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                <div className="bg-blue-500 rounded-l-full" style={{ width: `${(amount / total) * 100}%` }} />
                <div className="bg-amber-400 rounded-r-full flex-1" />
              </div>
              <div className="flex justify-between text-xs mt-1.5">
                <span className="text-slate-400">{((amount / total) * 100).toFixed(0)}%</span>
                <span className="text-slate-400">{((interests / total) * 100).toFixed(0)}%</span>
              </div>
            </div>

            <Link
              href={`/solicitar?monto=${amount}&plazo=${months}&motivo=${encodeURIComponent(type)}`}
              className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/30"
            >
              Solicitar este préstamo
            </Link>

            <p className="text-slate-500 text-xs text-center mt-3">
              Valor estimado. Sujeto a aprobación crediticia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
