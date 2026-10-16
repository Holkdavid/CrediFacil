'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
}

export default function Landing() {
  const router = useRouter();
  const onLogin = () => router.push('/login');
  const onRegister = () => router.push('/register');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [amount, setAmount] = useState(5000000);
  const [months, setMonths] = useState(12);
  const rate = 1.8;
  const monthlyRate = rate / 100;
  const quota = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const total = quota * months;
  const interests = total - amount;

  const faqs = [
    { q: '¿Cuánto tiempo demora la aprobación?', a: 'El proceso de evaluación tarda entre 24 y 48 horas hábiles. Una vez aprobado, el desembolso se realiza en menos de 24 horas.' },
    { q: '¿Qué documentos necesito?', a: 'Solo necesitas tu documento de identidad, comprobante de ingresos y datos de contacto. Todo el proceso es 100% digital.' },
    { q: '¿Puedo pagar anticipadamente?', a: 'Sí. Puedes realizar pagos anticipados sin penalidad. Esto reduce los intereses totales que pagas.' },
    { q: '¿Es seguro compartir mi información?', a: 'Sí. Usamos cifrado de grado bancario y cumplimos con todas las normas de protección de datos.' },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-[Inter]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-800 text-slate-900 text-lg tracking-tight">CrediFácil</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {['Inicio', 'Cómo funciona', 'Beneficios', 'Preguntas frecuentes'].map(item => (
                <a key={item} href="#" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">{item}</a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={onLogin} className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all">
                Iniciar sesión
              </button>
              <button onClick={onRegister} className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-sm">
                Solicitar préstamo
              </button>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-slate-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 px-4 py-4 space-y-2 bg-white">
            {['Inicio', 'Cómo funciona', 'Beneficios', 'Preguntas frecuentes'].map(item => (
              <a key={item} href="#" className="block text-sm text-slate-600 py-2">{item}</a>
            ))}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button onClick={onLogin} className="block w-full text-sm font-medium text-slate-700 bg-slate-100 py-2.5 rounded-lg">Iniciar sesión</button>
              <button onClick={onRegister} className="block w-full text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-lg">Solicitar préstamo</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Respuesta en 24 horas
            </div>
            <h1 className="font-display font-800 text-slate-900 text-4xl lg:text-5xl xl:text-[52px] leading-[1.1] tracking-tight mb-5">
              Obtén el préstamo que necesitas,{' '}
              <span className="text-blue-600">de forma simple y segura.</span>
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-xl">
              Solicita tu crédito en minutos, consulta tu capacidad, simula cuotas y administra tus pagos desde un solo lugar. Sin filas, sin papeleos innecesarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onRegister} className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5">
                Solicitar préstamo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-slate-50 transition-all">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 text-blue-600">
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <path d="M4 7h16M4 7l2 12h12L20 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Calcular cuota
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-5 mt-10 pt-8 border-t border-slate-100">
              {[
                { v: '+12.000', l: 'clientes activos' },
                { v: '$45B', l: 'desembolsados' },
                { v: '4.8/5', l: 'calificación' },
              ].map(s => (
                <div key={s.l}>
                  <p className="font-display font-700 text-slate-900 text-xl">{s.v}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simulator card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.75" className="w-4.5 h-4.5">
                  <path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3" />
                  <rect x="9" y="4" width="6" height="5" rx="1" />
                </svg>
              </div>
              <div>
                <p className="font-display font-700 text-slate-900">Simula tu cuota</p>
                <p className="text-xs text-slate-500">Ajusta monto y plazo</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Monto</label>
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(amount)}</span>
                </div>
                <input type="range" min={500000} max={50000000} step={500000} value={amount} onChange={e => setAmount(+e.target.value)}
                  className="w-full" style={{ background: `linear-gradient(to right, #2563eb ${((amount - 500000) / 49500000) * 100}%, #e2e8f0 ${((amount - 500000) / 49500000) * 100}%)` }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$500.000</span><span>$50.000.000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Plazo</label>
                  <span className="text-sm font-semibold text-blue-600">{months} meses</span>
                </div>
                <input type="range" min={3} max={60} step={3} value={months} onChange={e => setMonths(+e.target.value)}
                  className="w-full" style={{ background: `linear-gradient(to right, #2563eb ${((months - 3) / 57) * 100}%, #e2e8f0 ${((months - 3) / 57) * 100}%)` }}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>3 meses</span><span>60 meses</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 rounded-xl p-4 space-y-3">
              {[
                { l: 'Tasa de interés mensual', v: `${rate}%` },
                { l: 'Número de cuotas', v: `${months}` },
                { l: 'Total a pagar', v: formatCurrency(total) },
              ].map(row => (
                <div key={row.l} className="flex justify-between text-sm">
                  <span className="text-slate-500">{row.l}</span>
                  <span className="font-medium text-slate-800">{row.v}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-slate-700">Cuota mensual</span>
                  <span className="text-xl font-display font-700 text-blue-600">{formatCurrency(quota)}</span>
                </div>
              </div>
            </div>

            <button onClick={onRegister} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20">
              Solicitar este préstamo
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-700 text-slate-900 text-3xl lg:text-4xl mb-3">¿Por qué elegir CrediFácil?</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Diseñamos cada detalle para que obtener un crédito sea simple, transparente y sin sorpresas.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '💻', title: 'Solicitud 100% digital', desc: 'Sin filas, sin papeleos. Completa todo desde tu dispositivo en minutos.' },
              { icon: '⚡', title: 'Respuesta rápida', desc: 'Evaluamos tu solicitud en 24 horas y desembolsamos en menos de un día.' },
              { icon: '📊', title: 'Cuotas claras', desc: 'Conoces exactamente lo que vas a pagar desde el primer momento. Sin letras pequeñas.' },
              { icon: '🔒', title: 'Seguridad de tus datos', desc: 'Cifrado de grado bancario y cumplimiento con todas las normas de protección de datos.' },
            ].map(b => (
              <div key={b.title} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-2xl mb-3">{b.icon}</div>
                <h3 className="font-display font-700 text-slate-900 text-base mb-1.5">{b.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-700 text-slate-900 text-3xl lg:text-4xl mb-3">¿Cómo funciona?</h2>
            <p className="text-slate-500 text-lg">Cuatro pasos simples para obtener tu crédito</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '01', title: 'Simula tu préstamo', desc: 'Usa nuestro calculador para ver la cuota que mejor se adapta a tu presupuesto.' },
              { n: '02', title: 'Regístrate y solicita', desc: 'Completa el formulario con tu información personal y laboral en minutos.' },
              { n: '03', title: 'Recibe la evaluación', desc: 'Analizamos tu perfil crediticio y te damos una respuesta en 24 horas hábiles.' },
              { n: '04', title: 'Recibe el dinero', desc: 'Aprobado el crédito, el dinero llega a tu cuenta en menos de 24 horas.' },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px bg-slate-200 z-0" style={{ left: '100%', width: 'calc(100% - 2rem)', top: '1.25rem', transform: 'translateX(-50%)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-display font-700 text-sm mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-display font-700 text-slate-900 text-base mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display font-700 text-slate-900 text-3xl lg:text-4xl mb-3">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-slate-400 shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-blue-600 rounded-2xl p-10 lg:p-14">
            <h2 className="font-display font-700 text-white text-3xl lg:text-4xl mb-3">¿Listo para solicitar tu préstamo?</h2>
            <p className="text-blue-100 text-lg mb-8">Únete a más de 12.000 clientes que confían en CrediFácil.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button onClick={onRegister} className="bg-white text-blue-600 font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-blue-50 transition-all">
                Crear cuenta gratis
              </button>
              <button onClick={onLogin} className="border border-blue-400 text-white font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-white/10 transition-all">
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-display font-700 text-slate-900">CrediFácil</span>
              </div>
              <p className="text-slate-500 text-sm">Créditos rápidos, simples y seguros para ti.</p>
            </div>
            {[
              { title: 'Producto', links: ['Simulador', 'Solicitar préstamo', 'Mis préstamos', 'Pagos'] },
              { title: 'Empresa', links: ['Sobre nosotros', 'Blog', 'Prensa', 'Trabaja con nosotros'] },
              { title: 'Legal', links: ['Términos de uso', 'Privacidad', 'Seguridad', 'Regulatorio'] },
            ].map(col => (
              <div key={col.title}>
                <p className="font-semibold text-slate-900 text-sm mb-3">{col.title}</p>
                <div className="space-y-2">
                  {col.links.map(l => (
                    <a key={l} href="#" className="block text-slate-500 text-sm hover:text-slate-900 transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-400 text-xs">© 2026 CrediFácil. Todos los derechos reservados.</p>
            <p className="text-slate-400 text-xs">Vigilado por la Superintendencia Financiera de Colombia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
