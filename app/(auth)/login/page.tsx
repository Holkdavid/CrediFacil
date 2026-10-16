import Auth from '@/components/pages/Auth';

export const metadata = { title: 'Iniciar sesión · CrediFácil' };

export default function LoginPage() {
  return <Auth mode="login" />;
}
