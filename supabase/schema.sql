create table if not exists public.app_state (
  id integer primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_state (id, data)
values (
  1,
  '{"users":[{"username":"kellie","password":"kellie2004","role":"admin","unit":"System HQ"}],"reports":[],"inbox":[],"audit":[],"session":null}'::jsonb
)
on conflict (id) do nothing;
