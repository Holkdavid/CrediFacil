import Profile from '@/components/pages/Profile';
import { createClient } from '@/lib/supabase/server';
import type { Profile as ProfileRow } from '@/lib/types';

export const metadata = { title: 'Mi perfil · CrediFácil' };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();
  return <Profile profile={profile as ProfileRow} email={user!.email ?? ''} verified={!!user!.email_confirmed_at} />;
}
