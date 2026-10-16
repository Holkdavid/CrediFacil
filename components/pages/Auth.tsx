'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthProps {
  mode: 'login' | 'register';
}

export default function Auth({ mode }: AuthProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const onBack = () => router.push('/');
  const onToggleMode = () => router.push(mode === 'login' ? '/register' : '/login');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(''); setInfo('');
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') || '').trim();
    const password = String(f.get('password') || '');
    const supabase = createClient();
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message);
        return;
      }
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    // registro
    if (password.length < 8) { setLoading(false); setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== String(f.get('confirm') || '')) { setLoading(false); setError('Las contraseñas no coinciden.'); return; }
    if (!terms) { setLoading(false); setError('Debes aceptar los términos y condiciones.'); return; }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: String(f.get('full_name') || '').trim(),
          document: String(f.get('document') || '').trim(),
          phone: String(f.get('phone') || '').trim(),
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    if (data.session) { router.replace('/dashboard'); router.refresh(); }
    else setInfo('¡Cuenta creada! Revisa tu correo para confirmar tu registro y luego inicia sesión.');
  }

  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [terms, setTerms] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 bg-[#0f172a] p-10">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-12">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver al inicio
          </button>

          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-800 text-white text-lg tracking-tight">CrediFácil</span>
          </div>

          <h2 className="font-display font-700 text-white text-2xl leading-tight mb-3">
            Tu bienestar financiero, al alcance de un clic.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Más de 12.000 colombianos ya confían en nosotros para gestionar sus créditos de forma simple y transparente.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '✓', text: 'Proceso 100% en línea' },
              { icon: '✓', text: 'Respuesta en 24 horas' },
              { icon: '✓', text: 'Cuotas claras y sin sorpresas' },
              { icon: '✓', text: 'Seguridad bancaria' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-xs font-bold">✓</span>
                </div>
                <span className="text-slate-300 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2026 CrediFácil. Vigilado por la SFC.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <button onClick={onBack} className="text-slate-600 text-sm flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Inicio
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-700 text-slate-900 text-sm">CrediFácil</span>
          </div>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {mode === 'login' ? (
              <>
                <div className="mb-7">
                  <h1 className="font-display font-700 text-slate-900 text-2xl mb-1.5">Bienvenido de nuevo</h1>
                  <p className="text-slate-500 text-sm">Ingresa a tu cuenta para administrar tus créditos.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                    <input
                      type="email"
                      name="email" required autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400"
                      placeholder="tu@correo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        name="password" required autoComplete="current-password"
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4.5 h-4.5">
                          {showPass
                            ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M1 1l22 22" strokeLinecap="round" /></>
                            : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                          }
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded" />
                      <span className="text-sm text-slate-600">Recordarme</span>
                    </label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">¿Olvidaste tu contraseña?</a>
                  </div>

                  {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
                  {info && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">{info}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
                  >
                    {loading ? 'Ingresando…' : 'Iniciar sesión'}
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-1 border-t border-slate-200" />
                    <span className="px-3 text-xs text-slate-400 bg-slate-50 relative z-10">o</span>
                    <div className="flex-1 border-t border-slate-200" />
                  </div>

                  <p className="text-center text-sm text-slate-600">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={onToggleMode} className="text-blue-600 font-semibold hover:text-blue-700">
                      Crear cuenta gratis
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <div className="mb-7">
                  <h1 className="font-display font-700 text-slate-900 text-2xl mb-1.5">Crea tu cuenta</h1>
                  <p className="text-slate-500 text-sm">Completa tus datos para comenzar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre completo</label>
                      <input type="text" name="full_name" required placeholder="Juan García" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Documento</label>
                      <input type="text" name="document" required placeholder="1234567890" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
                    <input type="email" name="email" required autoComplete="email" placeholder="tu@correo.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                    <input type="tel" name="phone" required placeholder="300 123 4567" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                      <input type="password" name="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmar</label>
                      <input type="password" name="confirm" required autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-0.5 rounded" />
                    <span className="text-sm text-slate-600">
                      Acepto los{' '}
                      <a href="#" className="text-blue-600 font-medium">Términos y Condiciones</a>
                      {' '}y la{' '}
                      <a href="#" className="text-blue-600 font-medium">Política de Privacidad</a>
                    </span>
                  </label>

                  {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
                  {info && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">{info}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full disabled:opacity-60 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-blue-600/20"
                  >
                    {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                  </button>

                  <p className="text-center text-sm text-slate-600">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={onToggleMode} className="text-blue-600 font-semibold hover:text-blue-700">
                      Iniciar sesión
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
