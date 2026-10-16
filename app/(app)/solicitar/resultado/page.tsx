import { redirect } from 'next/navigation';
import ApplicationResult from '@/components/pages/ApplicationResult';
import { createClient } from '@/lib/supabase/server';
import type { Loan } from '@/lib/types';

export const metadata = { title: 'Solicitud recibida · CrediFácil' };

export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  if (!id) redirect('/prestamos');
  const supabase = await createClient();
  // RLS garantiza que solo se pueda leer un préstamo propio
  const { data: loan } = await supabase.from('loans').select('*').eq('id', id).maybeSingle();
  if (!loan) redirect('/prestamos');
  return <ApplicationResult loan={loan as Loan} />;
}
