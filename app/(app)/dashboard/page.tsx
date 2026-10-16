import Dashboard from '@/components/pages/Dashboard';
import { createClient } from '@/lib/supabase/server';
import type { Loan, Payment, Profile } from '@/lib/types';

export const metadata = { title: 'Dashboard · CrediFácil' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: profile }, { data: loans }, { data: payments }] = await Promise.all([
    supabase.from('profiles').select('full_name, client_code, credit_limit, created_at').eq('id', user!.id).single(),
    supabase.from('loans').select('*').order('created_at', { ascending: false }),
    supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(200),
  ]);

  const all = (loans ?? []) as Loan[];
  const active = all.filter(l => l.status === 'active');

  return (
    <Dashboard
      profile={(profile ?? { full_name: '', client_code: null, credit_limit: 0, created_at: new Date().toISOString() }) as Pick<Profile, 'full_name' | 'client_code' | 'credit_limit' | 'created_at'>}
      activeLoan={active[0] ?? null}
      activeCount={active.length}
      reviewCount={all.filter(l => l.status === 'review').length}
      payments={(payments ?? []) as Payment[]}
    />
  );
}
