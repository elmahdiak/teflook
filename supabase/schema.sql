-- ====================================================================
-- TefLook Moroccan Leather & Footwear - Supabase Schema
-- ====================================================================

create extension if not exists "uuid-ossp";

-- 1. Categories Table
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  name_ar text,
  description text not null,
  image_url text not null,
  item_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_ar text,
  category_slug text references public.categories(slug) on delete cascade not null,
  price_mad numeric not null,
  price_eur numeric not null,
  description text not null,
  material text not null,
  origin text default 'Fès & Marrakech, Maroc',
  images text[] not null,
  rating numeric(2,1) default 5.0,
  reviews_count int default 0,
  sizes int[] default '{38,39,40,41,42,43,44,45}',
  in_stock boolean default true,
  is_featured boolean default false,
  badge text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Customer Reviews Table
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  author_name text not null,
  city text not null,
  rating int default 5 not null check (rating >= 1 and rating <= 5),
  comment text not null,
  product_name text not null,
  product_image text not null,
  verified boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Newsletter Subscribers Table
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  locale text default 'fr',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Contact / Inquiries Table
create table if not exists public.contact_inquiries (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status text default 'new' check (status in ('new', 'contacted', 'resolved')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- Row Level Security (RLS)
-- ====================================================================
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_inquiries enable row level security;

-- Public read policies
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read products" on public.products for select using (true);
create policy "Allow public read reviews" on public.reviews for select using (true);

-- Public write for newsletter & contact
create policy "Allow public insert newsletter" on public.newsletter_subscribers for insert with check (true);
create policy "Allow public insert contact" on public.contact_inquiries for insert with check (true);
