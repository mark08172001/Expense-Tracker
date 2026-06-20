# Expense Tracker Database Schema

Create these tables in your Supabase PostgreSQL database.

## users table

```sql
create table users (
  id bigint primary key generated always as identity,
  email text not null unique,
  full_name text,
  password_hash text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index on users(email);
```

## categories table

```sql
create table categories (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id) on delete cascade,
  name text not null,
  type text not null check(type in ('income', 'expense')),
  icon text default '📌',
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index on categories(user_id);
create index on categories(user_id, type);
```

## transactions table

```sql
create table transactions (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id) on delete cascade,
  category_id bigint not null references categories(id),
  amount numeric(10, 2) not null,
  transaction_type text not null check(transaction_type in ('income', 'expense')),
  payment_method text,
  transaction_date date not null,
  notes text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index on transactions(user_id);
create index on transactions(user_id, transaction_date);
create index on transactions(user_id, category_id);
create index on transactions(transaction_date);
```

## budgets table

```sql
create table budgets (
  id bigint primary key generated always as identity,
  user_id bigint not null references users(id) on delete cascade,
  category_id bigint not null references categories(id),
  monthly_limit numeric(10, 2) not null,
  month text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index on budgets(user_id);
create index on budgets(user_id, month);
create unique index on budgets(user_id, category_id, month);
```

## Row Level Security (RLS)

Enable RLS for security:

```sql
-- Enable RLS on all tables
alter table users enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

-- Users can only see their own data
create policy "Users can view own data" on users
  for select using (auth.uid()::text = id::text);

create policy "Categories are isolated per user" on categories
  for all using (user_id = auth.uid()::bigint);

create policy "Transactions are isolated per user" on transactions
  for all using (user_id = auth.uid()::bigint);

create policy "Budgets are isolated per user" on budgets
  for all using (user_id = auth.uid()::bigint);
```

## Notes

- All timestamps are in UTC
- Use `YYYY-MM-DD` format for dates
- Use `YYYY-MM` format for budget months
- Amount fields support up to 10 digits with 2 decimal places
- Enable RLS policies in Supabase for security
