create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  category text,
  price_lkr integer not null check (price_lkr >= 0),
  image_url text,
  image_urls text[] not null default '{}',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table products add column if not exists image_urls text[] not null default '{}';
update products
set image_urls = case
  when image_url is not null and cardinality(image_urls) = 0 then array[image_url]
  else image_urls
end;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  stripe_session_id text unique not null,
  total_amount integer not null check (total_amount >= 0),
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  subtotal integer not null check (subtotal >= 0)
);

create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category);

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;

drop policy if exists "public can read active products" on products;
create policy "public can read active products" on products
for select using (is_active = true);

drop policy if exists "admin full products access" on products;
create policy "admin full products access" on products
for all using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
  )
);

drop policy if exists "admin users self read" on admin_users;
create policy "admin users self read" on admin_users
for select using (user_id = auth.uid());
