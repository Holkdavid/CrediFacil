import MyLoans from '@/components/pages/MyLoans';
import { createClient } from '@/lib/supabase/server';
import type { Loan } from '@/lib/types';

export const metadata = { title: 'Mis préstamos · CrediFácil' };

export default async function PrestamosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
  return <MyLoans rows={(data ?? []) as Loan[]} />;
}
