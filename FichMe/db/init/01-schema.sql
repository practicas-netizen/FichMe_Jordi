create table companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  background_color text not null default '#0F172A',
  pin_button_color text not null default '#2563EB',
  date_format text not null default 'long'
    check (date_format in ('short', 'long')),
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  pin text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, pin)
);

create table time_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  employee_id uuid not null references employees(id),
  type text not null check (type in ('in', 'out')),
  clocked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index on time_entries (employee_id, clocked_at desc);