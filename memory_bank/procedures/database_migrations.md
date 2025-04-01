# Database Migration Procedures

## Migration File Structure

Migration files are stored in `supabase/migrations/` and follow this naming convention:
`YYYYMMDDHHMMSS_descriptive_name.sql`

For example: `20250307100515_add_reviews.sql`

## Creating a New Migration

1. Generate a timestamp for the migration name:
   - Use the current UTC time
   - Format: YYYYMMDDHHMMSS
   - Example: 20250313152845 for March 13, 2025, 15:28:45

2. Create the migration file:
   - Place in `supabase/migrations/`
   - Use format: `{timestamp}_{descriptive_name}.sql`
   - Use lowercase with underscores for the descriptive name

3. Write the migration SQL:
   ```sql
   -- Up migration
   -- Add clear comments explaining the changes
   
   -- Example:
   CREATE TABLE example_table (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   ```

## Migration Rules

1. Never modify existing migration files
2. Always create new migration files for changes
3. Include clear comments explaining the purpose of each migration
4. Consider security implications (RLS policies)
5. Test migrations in development before applying to production

## Common Patterns

1. Table Creation:
   ```sql
   CREATE TABLE table_name (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
   );
   ```

2. Adding RLS Policies:
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "policy_name"
   ON table_name
   FOR operation_type TO authenticated
   USING (auth.uid() = user_id);
   ```

3. Adding References:
   ```sql
   ALTER TABLE table_name
   ADD COLUMN reference_id uuid REFERENCES other_table(id);
