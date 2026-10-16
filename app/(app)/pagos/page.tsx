import Payments from '@/components/pages/Payments';
import { createClient } from '@/lib/supabase/server';
import type { Loan, Payment } from '@/lib/types';

export const metadata = { title: 'Pagos · CrediFácil' };

export default async function PagosPage() {
  const supabase = await createClient();
  const [{ data: loans }, { data: payments }] = await Promise.all([
    supabase.from('loans').select('*').eq('status', 'active').order('next_payment', { ascending: true }).limit(1),
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
  ]);
  return <Payments loan={((loans ?? [])[0] ?? null) as Loan | null} history={(payments ?? []) as Payment[]} />;
}
