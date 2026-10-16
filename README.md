# CrediFácil

Plataforma de préstamos en línea. **Next.js 16 (App Router) + Tailwind v4 + Supabase** (autenticación y PostgreSQL), lista para desplegar en Vercel.

## Qué incluye

| Ruta | Descripción |
|---|---|
| `/` | Landing con simulador rápido |
| `/login`, `/register` | Autenticación real con Supabase |
| `/dashboard` | Resumen: cupo, préstamo activo, próxima cuota, gráfico de pagos |
| `/simulador` | Simulador de cuota (sistema francés, 1,8 % mensual) |
| `/solicitar` | Solicitud en 4 pasos → guarda perfil y crea el préstamo en estado *En revisión* |
| `/prestamos` | Historial y detalle de cada préstamo |
| `/pagos` | Pago de la siguiente cuota e historial |
| `/perfil` | Datos personales, cambio de contraseña, preferencias de notificación |

Seguridad: Row Level Security en todas las tablas (cada usuario solo ve lo suyo), cuotas/códigos/tasa calculados en la base de datos y pagos solo mediante la función `pay_next_quota`.

## 1. Supabase

1. Crea un proyecto en <https://supabase.com> (plan gratuito).
2. **SQL Editor → New query**, pega todo `supabase/schema.sql` y ejecuta.
3. **Project Settings → API**: copia `Project URL` y la clave `anon public`.
4. *(Opcional, recomendado para probar)* **Authentication → Providers → Email → desactiva "Confirm email"** para que el registro entre directo. Si lo dejas activo, el usuario debe confirmar su correo.
5. **Authentication → URL Configuration**: cuando tengas la URL de Vercel, ponla en *Site URL* y agrega `https://TU-APP.vercel.app/**` en *Redirect URLs*.

## 2. Probar en local

```bash
cp .env.example .env.local   # y completa las dos variables
npm install
npm run dev                  # http://localhost:3000
```

## 3. GitHub + Vercel

```bash
git init
git add .
git commit -m "CrediFácil: versión inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/credifacil.git
git push -u origin main
```

1. En <https://vercel.com/new> importa el repositorio (detecta Next.js solo).
2. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Deploy**.

## Aprobar solicitudes (por ahora manual)

Las solicitudes nuevas quedan en *En revisión*. Para activarlas ejecuta en el SQL Editor:

```sql
update public.loans
   set status = 'active', next_payment = current_date + interval '1 month'
 where code = 'CR-2026-001000';   -- el código aparece en "Mis préstamos"
```

## Pendiente / ideas siguientes

- Panel de administración para aprobar o rechazar solicitudes.
- Pasarela de pagos real (PSE / tarjeta, p. ej. Wompi o PayU): hoy el pago solo se registra.
- Envío real de correos/SMS: las preferencias de notificación se guardan pero no disparan mensajes.
- Revisar los textos legales y cifras de la landing (ver nota abajo).

> **Nota:** la landing conserva los textos del mockup (“+12.000 clientes”, “$45B desembolsados”, “Vigilado por la SFC”, tasa 1,8 %). Sustitúyelos por datos reales antes de publicar.
