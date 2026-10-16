import LoanApplication from '@/components/pages/LoanApplication';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export const metadata = { title: 'Solicitar préstamo · CrediFácil' };

const PURPOSES = ['Libre inversión', 'Educación', 'Salud', 'Vivienda', 'Negocio / Emprendimiento', 'Vehículo', 'Viajes'];

export default async function SolicitarPage({
  searchParams,
}: {
  searchParams: Promise<{ monto?: string; plazo?: string; motivo?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const clamp = (n: number, min: number, max: number, fallback: number) =>
    Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : fallback;

  return (
    <LoanApplication
      userId={user!.id}
      profile={profile as Profile}
      initial={{
        amount: clamp(Number(sp.monto), 500000, 50000000, 8000000),
        months: clamp(Number(sp.plazo), 3, 60, 18),
        purpose: PURPOSES.includes(sp.motivo ?? '') ? sp.motivo! : 'Libre inversión',
      }}
    />
  );
}
