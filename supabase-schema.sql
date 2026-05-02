-- ============================================================
-- FFC HORECA Operations Center — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── TEAMS ────────────────────────────────────────────────────
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  color text not null default 'blue',
  created_at timestamptz default now()
);

insert into teams (name, color) values
  ('Team A', 'blue'),
  ('Team B', 'purple'),
  ('Team C', 'amber'),
  ('Team D', 'green')
on conflict (name) do nothing;

-- ── STAFF ────────────────────────────────────────────────────
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  employee_id text not null unique,
  team_id uuid references teams(id),
  role text not null default 'Packer',
  shift text not null default 'Day' check (shift in ('Day', 'Night')),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── ORDERS ───────────────────────────────────────────────────
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_ref text not null unique,
  customer text not null,
  category text not null,
  packaging text not null default 'Standard Box',
  qty_ordered integer not null default 0,
  qty_done integer not null default 0,
  priority text not null default 'Normal' check (priority in ('Normal', 'High', 'Urgent')),
  status text not null default 'Pending' check (status in ('Pending', 'Assigned', 'Active', 'Done', 'Cancelled')),
  team_id uuid references teams(id),
  assigned_at timestamptz,
  start_time timestamptz,
  end_time timestamptz,
  notes text,
  shift text not null default 'Day' check (shift in ('Day', 'Night')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── PACKING ASSIGNMENTS ──────────────────────────────────────
create table if not exists packing_assignments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  team_id uuid not null references teams(id),
  assigned_by text not null default 'Supervisor',
  start_time timestamptz,
  end_time timestamptz,
  qty_target integer not null default 0,
  qty_done integer not null default 0,
  notes text,
  status text not null default 'Active' check (status in ('Active', 'Done', 'Paused')),
  created_at timestamptz default now()
);

-- ── BREAK LOGS ───────────────────────────────────────────────
create table if not exists break_logs (
  id uuid primary key default uuid_generate_v4(),
  staff_id uuid references staff(id),
  employee_name text not null,
  employee_ref text not null default '',
  team_id uuid references teams(id),
  team_name text not null,
  reason text not null check (reason in ('Rest Room', 'Prayer', 'Food Break', 'Personal', 'Medical', 'Emergency')),
  check_out timestamptz not null default now(),
  check_in timestamptz,
  duration_minutes integer,
  shift text not null default 'Day',
  notes text,
  created_at timestamptz default now()
);

-- ── AUTO-UPDATE updated_at ───────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table teams enable row level security;
alter table staff enable row level security;
alter table orders enable row level security;
alter table packing_assignments enable row level security;
alter table break_logs enable row level security;

-- Allow all operations for now (tighten with auth later)
create policy "allow_all_teams" on teams for all using (true) with check (true);
create policy "allow_all_staff" on staff for all using (true) with check (true);
create policy "allow_all_orders" on orders for all using (true) with check (true);
create policy "allow_all_assignments" on packing_assignments for all using (true) with check (true);
create policy "allow_all_breaks" on break_logs for all using (true) with check (true);

-- ── SEED DATA ────────────────────────────────────────────────
-- Sample staff (optional — remove if using real data)
do $$
declare
  team_a uuid; team_b uuid; team_c uuid; team_d uuid;
begin
  select id into team_a from teams where name = 'Team A';
  select id into team_b from teams where name = 'Team B';
  select id into team_c from teams where name = 'Team C';
  select id into team_d from teams where name = 'Team D';

  insert into staff (name, employee_id, team_id, role, shift) values
    ('Ahmed Khalid',     'FFC-012', team_a, 'Packer',        'Day'),
    ('Sara Mansoor',     'FFC-019', team_b, 'Packer',        'Day'),
    ('Khalid Rashid',    'FFC-007', team_a, 'Senior Packer', 'Day'),
    ('Fatima Al Zaabi',  'FFC-031', team_c, 'QC Inspector',  'Day'),
    ('Omar Hassan',      'FFC-044', team_d, 'Packer',        'Day'),
    ('Noor Khalil',      'FFC-028', team_b, 'Team Lead',     'Day'),
    ('Rashed Al Ameri',  'FFC-055', team_c, 'Packer',        'Night'),
    ('Maha Salim',       'FFC-061', team_d, 'Team Lead',     'Night')
  on conflict (employee_id) do nothing;
end $$;
