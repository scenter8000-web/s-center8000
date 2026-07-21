-- Run this entire file once in Supabase: SQL Editor -> New query -> Run

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('iphone', 'android', 'accessory')),
  price text not null,
  description text not null default '',
  image_url text not null,
  tag text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products"
on public.products for select using (true);

create policy "Authenticated users manage products"
on public.products for all to authenticated
using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "Anyone can view product images"
on storage.objects for select using (bucket_id = 'product-images');

create policy "Authenticated users upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

create policy "Authenticated users update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images') with check (bucket_id = 'product-images');

create policy "Authenticated users delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');

-- Starter catalogue. You can edit or delete these from the admin page later.
insert into public.products (name, category, price, description, image_url, tag)
select * from (values
  ('iPhone 16 Pro Max', 'iphone', '1,850,000 IQD', '256GB • Natural Titanium • نوێ', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=700&q=80', 'NEW'),
  ('iPhone 15 Pro Max', 'iphone', '1,420,000 IQD', '256GB • Blue Titanium • نوێ', 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=700&q=80', 'POPULAR'),
  ('Galaxy S26 Ultra', 'android', '1,650,000 IQD', '512GB • Titanium Black • نوێ', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=80', 'NEW'),
  ('AirPods Pro 2', 'accessory', '315,000 IQD', 'USB-C • Active Noise Cancellation', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80', 'ORIGINAL')
) as starter(name, category, price, description, image_url, tag)
where not exists (select 1 from public.products);
