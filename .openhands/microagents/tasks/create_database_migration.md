# Create Supabase Database Migration

Creates and applies a new database migration for Supabase, following project standards and best practices.

## Trigger
"create migration", "add migration", "new database migration"

## Inputs
- Migration name (required)
- Migration type (optional: create/alter/drop)
- Tables affected (optional)
- Description (optional)

## Steps

1. Generate Migration File
```bash
# Create timestamped migration file
timestamp=$(date -u +"%Y%m%d%H%M%S")
filename="${timestamp}_${migration_name}.sql"
```

2. Migration Templates

### Table Creation
```sql
-- Migration: Create new table
begin;

create table if not exists table_name (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Add columns here
);

-- Add indexes
create index if not exists idx_table_name_column 
  on table_name(column_name);

-- Set up RLS
alter table table_name enable row level security;

-- Create policies
create policy "Users can read own records"
  on table_name for select
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on table_name for insert
  with check (auth.uid() = user_id);

-- Add triggers
create trigger set_updated_at
  before update on table_name
  for each row
  execute function update_updated_at_column();

commit;
```

### Table Modification
```sql
-- Migration: Alter existing table
begin;

-- Add columns
alter table table_name
  add column if not exists new_column_name text,
  add column if not exists another_column integer;

-- Add constraints
alter table table_name
  add constraint fk_other_table
  foreign key (other_id)
  references other_table(id)
  on delete cascade;

-- Update policies
create policy "New access policy"
  on table_name for select
  using (conditions);

commit;
```

### Function Creation
```sql
-- Migration: Create function
begin;

create or replace function function_name(param1 text)
returns table (
  column1 text,
  column2 integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Function logic here
  return query
    select column1, column2
    from some_table
    where condition = param1;
end;
$$;

-- Grant permissions
grant execute on function function_name(text) to authenticated;

commit;
```

3. Write Migration Content
- Use appropriate template
- Follow naming conventions
- Include comments
- Handle errors
- Add rollback steps

4. Generate Rollback Migration
```sql
-- Rollback previous migration
begin;

-- Reverse the changes here
drop table if exists table_name cascade;
-- or
alter table table_name
  drop column if exists column_name;
-- or
drop function if exists function_name(text);

commit;
```

5. Test Migration
```bash
# Apply migration
supabase db reset

# Verify changes
supabase db dump

# Test rollback
supabase db reset --timestamp {previous_timestamp}
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
- Error handling
- Proper permissions
- RLS policies
- Indexing strategy
- Trigger handling

### Testing Requirements
- Forward migration works
- Rollback succeeds
- Data integrity maintained
- Permissions correct
- Performance acceptable

## Examples

### Create Table
```bash
# Create new table migration
claude create migration add_users_table
```

### Add Column
```bash
# Add column to existing table
claude create migration add_user_preferences
```

### Create Function
```bash
# Create database function
claude create migration add_search_function
```

## Best Practices

### Naming Conventions
- Use snake_case
- Descriptive names
- Include timestamp
- Indicate purpose

### Schema Design
- Use appropriate types
- Add constraints
- Include indexes
- Set up RLS
- Handle nulls

### Security
- Enable RLS
- Set permissions
- Validate inputs
- Secure functions
- Audit sensitive operations

### Performance
- Optimize queries
- Add indexes
- Handle large tables
- Consider locks
- Monitor execution time

### Documentation
- Clear descriptions
- Change reasons
- Dependencies noted
- Breaking changes
- Performance impact

## Notes
- Always test migrations
- Keep atomic changes
- Include rollback plans
- Consider dependencies
- Monitor performance
- Backup before applying
- Follow security best practices
