-- =====================================================================
-- CrediFácil · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase → SQL Editor → New query → Run
-- =====================================================================

-- ---------- PERFILES ----------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null default '',
  document          text,
  phone             text,
  birth_date        date,
  gender            text,
  address           text,
  occupation        text,
  company           text,
  contract_type     text,
  monthly_income    numeric(14,0),
  monthly_expenses  numeric(14,0),
  credit_limit      numeric(14,0) not null default 15000000,
  notify_quota      boolean not null default true,
  notify_payment    boolean not null default true,
  notify_offers     boolean not null default false,
  client_code       text unique,
  created_at        timestamptz not null default now()
);

create sequence if not exists public.client_code_seq start 100;

-- ---------- PRÉSTAMOS ----------
create sequence if not exists public.loan_code_seq start 1000;

create table if not exists public.loans (
  id               uuid primary key default gen_random_uuid(),
  code             text unique,
  user_id          uuid not null references auth.users(id) on delete cascade,
  loan_type        text not null default 'Libre inversión',
  purpose          text,
  amount           numeric(14,0) not null check (amount between 500000 and 50000000),
  months           int not null check (months between 3 and 60),
  monthly_rate     numeric(5,2) not null default 1.8,
  quota_amount     numeric(14,0),
  total_amount     numeric(14,0),
  interest_total   numeric(14,0),
  paid_quotas      int not null default 0,
  status           text not null default 'review'
                     check (status in ('review','active','paid','rejected')),
  next_payment     date,
  created_at       timestamptz not null default now()
);
create index if not exists loans_user_idx on public.loans(user_id, created_at desc);

-- ---------- PAGOS ----------
create sequence if not exists public.payment_code_seq start 100;

create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  code         text unique,
  loan_id      uuid not null references public.loans(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  amount       numeric(14,0) not null,
  method       text not null,
  status       text not null default 'Exitoso',
  quota_number int not null,
  created_at   timestamptz not null default now()
);
create index if not exists payments_user_idx on public.payments(user_id, created_at desc);

-- =====================================================================
-- TRIGGERS Y FUNCIONES
-- =====================================================================

-- Al registrarse un usuario se crea su perfil con los datos del formulario.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, document, phone, client_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'document',
    new.raw_user_meta_data->>'phone',
    'CF-' || lpad(nextval('public.client_code_seq')::text, 5, '0')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Al crear un préstamo: el servidor calcula código, cuota y totales
-- (sistema francés, cuota fija) y fuerza estado "review".
create or replace function public.prepare_loan()
returns trigger language plpgsql as $$
declare
  r numeric := new.monthly_rate / 100;
begin
  new.code           := 'CR-' || extract(year from now())::int || '-' || lpad(nextval('public.loan_code_seq')::text, 6, '0');
  new.status         := 'review';
  new.monthly_rate   := 1.8;   -- la tasa la define el servidor, no el cliente
  new.paid_quotas    := 0;
  new.quota_amount   := round(new.amount * r * power(1 + r, new.months) / (power(1 + r, new.months) - 1));
  new.total_amount   := new.quota_amount * new.months;
  new.interest_total := new.total_amount - new.amount;
  return new;
end $$;

drop trigger if exists loans_prepare on public.loans;
create trigger loans_prepare
  before insert on public.loans
  for each row execute function public.prepare_loan();

-- Pago de la siguiente cuota. Se llama desde la app con supabase.rpc('pay_next_quota').
-- Es "security definer" porque los usuarios NO pueden escribir pagos directamente.
create or replace function public.pay_next_quota(p_loan_id uuid, p_method text)
returns public.payments language plpgsql security definer set search_path = public as $$
declare
  l public.loans;
  p public.payments;
begin
  select * into l from public.loans
   where id = p_loan_id and user_id = auth.uid() and status = 'active'
   for update;
  if not found then
    raise exception 'Préstamo no encontrado o no está activo';
  end if;

  insert into public.payments (code, loan_id, user_id, amount, method, status, quota_number)
  values ('PAY-' || lpad(nextval('public.payment_code_seq')::text, 5, '0'),
          l.id, l.user_id, l.quota_amount, p_method, 'Exitoso', l.paid_quotas + 1)
  returning * into p;

  update public.loans
     set paid_quotas = paid_quotas + 1,
         status      = case when paid_quotas + 1 >= months then 'paid' else status end,
         next_payment = case when paid_quotas + 1 >= months then null
                             else (coalesce(next_payment, current_date) + interval '1 month')::date end
   where id = l.id;

  return p;
end $$;

grant execute on function public.pay_next_quota(uuid, text) to authenticated;

-- =====================================================================
-- SEGURIDAD (Row Level Security): cada usuario solo ve lo suyo
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.loans    enable row level security;
alter table public.payments enable row level security;

drop policy if exists "perfil: leer el propio"       on public.profiles;
drop policy if exists "perfil: actualizar el propio" on public.profiles;
create policy "perfil: leer el propio"       on public.profiles for select using (auth.uid() = id);
create policy "perfil: actualizar el propio" on public.profiles for update using (auth.uid() = id)
  with check (auth.uid() = id);
-- credit_limit y client_code no deben ser editables por el usuario:
revoke update on public.profiles from authenticated;
grant  update (full_name, document, phone, birth_date, gender, address, occupation, company,
               contract_type, monthly_income, monthly_expenses,
               notify_quota, notify_payment, notify_offers)
  on public.profiles to authenticated;

drop policy if exists "préstamos: leer los propios"  on public.loans;
drop policy if exists "préstamos: crear solicitud"   on public.loans;
create policy "préstamos: leer los propios" on public.loans for select using (auth.uid() = user_id);
create policy "préstamos: crear solicitud"  on public.loans for insert with check (auth.uid() = user_id);

drop policy if exists "pagos: leer los propios" on public.payments;
create policy "pagos: leer los propios" on public.payments for select using (auth.uid() = user_id);
-- (sin policy de insert/update: los pagos solo se crean con pay_next_quota)

-- =====================================================================
-- OPCIONAL · Aprobar una solicitud manualmente (hasta tener panel admin)
-- Reemplaza el código por el de tu préstamo y ejecuta en el SQL Editor:
--
--   update public.loans
--      set status = 'active', next_payment = current_date + interval '1 month'
--    where code = 'CR-2026-001000';
-- =====================================================================
