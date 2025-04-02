---
name: Create Database Migration
description: Creates and applies Supabase database migrations with proper structure and rollbacks
type: task
triggers: [create migration, add migration, new database migration]
author: OpenHands
version: 1.0.0
---

# Database Migration Generator

Creates standardized Supabase database migrations with rollback support.

## Usage

```bash
claude create migration add_users_table
claude create migration add_user_preferences --type alter
claude create migration add_search_function --type function
```

## Process

1. Generate Migration File
```bash
# Create timestamped file
timestamp=$(date -u +"%Y%m%d%H%M%S")
filename="supabase/migrations/${timestamp}_${name}.sql"
```

2. Migration Templates

### Table Creation
```sql
-- Migration: Create new table
begin;

create table if not exists table_name (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add indexes
create index if not exists idx_table_name_column 
  on table_name(column_name);

-- Enable RLS
alter table table_name enable row level security;

-- Add policies
create policy "Users can read own records"
  on table_name for select
  using (auth.uid() = user_id);

commit;
```

### Table Modification
```sql
-- Migration: Alter existing table
begin;

-- Add columns
alter table table_name
  add column if not exists new_column text;

-- Add constraints
alter table table_name
  add constraint fk_other_table
  foreign key (other_id)
  references other_table(id);

commit;
```

### Function Creation
```sql
-- Migration: Create function
begin;

create or replace function function_name(param1 text)
returns table (column1 text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select column1
    from some_table
    where condition = param1;
end;
$$;

-- Grant permissions
grant execute on function function_name(text) to authenticated;

commit;
```

## Validation

### Required Structure
```
supabase/
└── migrations/
    ├── YYYYMMDDHHMMSS_migration_name.sql
    └── YYYYMMDDHHMMSS_migration_name_rollback.sql
```

### Migration Standards
- Atomic operations
- Transaction blocks
- Error handling
- RLS policies
- Proper indexes

### Testing Steps
1. Apply migration
2. Verify changes
3. Test rollback
4. Check constraints
5. Validate policies

## Examples

### Add Table
```sql
-- 20250401000000_add_books_table.sql
begin;

create table books (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author_id uuid references authors(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_books_author on books(author_id);
alter table books enable row level security;

commit;
```

### Modify Table
```sql
-- 20250401000001_add_book_status.sql
begin;

alter table books
  add column status text default 'draft'
  check (status in ('draft', 'published', 'archived'));

create policy "Anyone can read published books"
  on books for select
  using (status = 'published');

commit;
```

## Best Practices

### Schema Design
- Use appropriate types
- Add constraints
- Include indexes
- Enable RLS
- Handle nulls

### Migration Safety
- Test migrations
- Include rollbacks
- Atomic changes
- Handle errors
- Backup data

### Documentation
- Clear descriptions
- Note dependencies
- List changes
- Performance impact
- Security implications
