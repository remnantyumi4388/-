create extension if not exists pgcrypto;

create table if not exists portfolio_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null,
  type text not null check (type in ('project', 'activity', 'award', 'research')),
  title text not null,
  summary text,
  description text,
  final_date date not null,
  tags text[] default '{}',
  tech_stack text[] default '{}',
  organization text,
  role text,
  result text,
  links jsonb default '{}',
  thumbnail_url text,
  is_featured boolean default false,
  is_public boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists portfolio_files (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references portfolio_entries(id) on delete cascade,
  file_name text not null,
  file_label text,
  file_type text not null check (file_type in ('PDF', 'PPT', 'PPTX', 'IMAGE', 'ZIP', 'CODE', 'OTHER')),
  mime_type text,
  file_size bigint default 0,
  storage_path text not null,
  public_url text,
  created_at timestamp with time zone default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists portfolio_entries_updated_at on portfolio_entries;
create trigger portfolio_entries_updated_at
before update on portfolio_entries
for each row execute function set_updated_at();

alter table portfolio_entries enable row level security;
alter table portfolio_files enable row level security;

drop policy if exists "Public can read public entries" on portfolio_entries;
create policy "Public can read public entries"
on portfolio_entries for select
using (is_public = true);

drop policy if exists "Public can read public files" on portfolio_files;
create policy "Public can read public files"
on portfolio_files for select
using (
  exists (
    select 1 from portfolio_entries
    where portfolio_entries.id = portfolio_files.entry_id
      and portfolio_entries.is_public = true
  )
);

create index if not exists portfolio_entries_owner_id_idx on portfolio_entries(owner_id);
create index if not exists portfolio_entries_final_date_idx on portfolio_entries(final_date desc);

-- owner_id is matched with PORTFOLIO_USER_1_ID / PORTFOLIO_USER_2_ID in the app.
