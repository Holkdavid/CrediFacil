export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-lg bg-white border border-amber-200 rounded-2xl p-7 shadow-sm">
        <h1 className="font-display font-700 text-slate-900 text-xl mb-2">Falta configurar Supabase</h1>
        <p className="text-slate-600 text-sm mb-4">
          Define estas variables de entorno (en <code>.env.local</code> o en Vercel → Settings → Environment Variables) y vuelve a desplegar:
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs rounded-xl p-4 overflow-x-auto">{`NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY`}</pre>
      </div>
    </div>
  );
}
