import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import SetupNotice from '@/components/SetupNotice';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return <SetupNotice />;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
  return <AppShell name={profile?.full_name || user.email || ''}>{children}</AppShell>;
}
