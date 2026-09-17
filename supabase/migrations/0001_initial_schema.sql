-- Habilitar extensão de UUID
create extension if not exists "uuid-ossp";

-- Tabela de Perfis de Usuários & Brand Kit
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle varchar(50),
  primary_color varchar(7) default '#663B1A',
  secondary_color varchar(7) default '#DCD1EF',
  background_color varchar(7) default '#EDEAE6',
  accent_color varchar(7) default '#C29F58',
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabela de Cronogramas Semanais
create table weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  niche varchar(100) not null,
  weekly_goal varchar(100),
  schedule_content jsonb not null,
  created_at timestamptz default now()
);

-- Tabela de Roteiros Gerados
create table scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  prompt_template varchar(50) not null,
  topic text not null,
  niche varchar(100),
  tone varchar(50),
  duration varchar(20),
  script_content jsonb not null,
  created_at timestamptz default now()
);

-- Tabela de Carrosséis e Cards Gerados
create table carousels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  prompt_template varchar(50) not null,
  title text not null,
  theme_style varchar(50) default 'anis_editorial',
  slides_content jsonb not null,
  created_at timestamptz default now()
);

-- Índices para consultas por usuário
create index weekly_schedules_user_id_idx on weekly_schedules(user_id);
create index scripts_user_id_idx on scripts(user_id);
create index carousels_user_id_idx on carousels(user_id);

-- Row Level Security: cada usuário só acessa seus próprios dados
alter table profiles enable row level security;
alter table weekly_schedules enable row level security;
alter table scripts enable row level security;
alter table carousels enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on profiles for select using (auth.uid() = id);
create policy "Usuários podem atualizar o próprio perfil"
  on profiles for update using (auth.uid() = id);
create policy "Usuários podem criar o próprio perfil"
  on profiles for insert with check (auth.uid() = id);

create policy "Usuários podem ver os próprios cronogramas"
  on weekly_schedules for select using (auth.uid() = user_id);
create policy "Usuários podem criar os próprios cronogramas"
  on weekly_schedules for insert with check (auth.uid() = user_id);
create policy "Usuários podem apagar os próprios cronogramas"
  on weekly_schedules for delete using (auth.uid() = user_id);

create policy "Usuários podem ver os próprios roteiros"
  on scripts for select using (auth.uid() = user_id);
create policy "Usuários podem criar os próprios roteiros"
  on scripts for insert with check (auth.uid() = user_id);
create policy "Usuários podem apagar os próprios roteiros"
  on scripts for delete using (auth.uid() = user_id);

create policy "Usuários podem ver os próprios carrosséis"
  on carousels for select using (auth.uid() = user_id);
create policy "Usuários podem criar os próprios carrosséis"
  on carousels for insert with check (auth.uid() = user_id);
create policy "Usuários podem apagar os próprios carrosséis"
  on carousels for delete using (auth.uid() = user_id);

-- Trigger: cria automaticamente um profile quando um usuário se cadastra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
