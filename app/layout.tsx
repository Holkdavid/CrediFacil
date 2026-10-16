import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrediFácil · Préstamos en línea',
  description: 'Solicita tu crédito en minutos, simula cuotas y administra tus pagos desde un solo lugar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
