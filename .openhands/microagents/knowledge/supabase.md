# Supabase Development Knowledge

## Keywords
supabase, postgresql, auth, storage, realtime, rpc, postgrest, database, migrations, policies

## Overview
Expert in Supabase platform development, including authentication, database management, storage, and real-time subscriptions.

## Authentication

### Setup and Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### User Management
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Sign out
const { error } = await supabase.auth.signOut();

// Get session
const { data: { session }, error } = await supabase.auth.getSession();
```

## Database Operations

### Queries
```typescript
// Select
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2, relation(*)')
  .eq('column', 'value')
  .order('created_at', { ascending: false });

// Insert
const { data, error } = await supabase
  .from('table_name')
  .insert([{ column1: 'value1', column2: 'value2' }])
  .select();

// Update
const { data, error } = await supabase
  .from('table_name')
  .update({ column1: 'new_value' })
  .eq('id', 123)
  .select();

// Delete
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', 123);
```

### Row Level Security (RLS)
```sql
-- Enable RLS
alter table table_name enable row level security;

-- Create policy
create policy "Users can read public posts"
  on posts
  for select
  using (is_public = true);

-- Auth check policy
create policy "Users can update own posts"
  on posts
  for update
  using (auth.uid() = user_id);
```

## Storage

### File Operations
```typescript
// Upload
const { data, error } = await supabase.storage
  .from('bucket_name')
  .upload('file_path', file);

// Download
const { data, error } = await supabase.storage
  .from('bucket_name')
  .download('file_path');

// Delete
const { error } = await supabase.storage
  .from('bucket_name')
  .remove(['file_path']);
```

### Storage Policies
```sql
-- Public bucket policy
create policy "Public Access"
  on storage.objects
  for select
  using (bucket_id = 'public');

-- User-specific policy
create policy "User Access"
  on storage.objects
  for all
  using (auth.uid() = owner_id);
```

## Real-time Subscriptions

### Channel Setup
```typescript
// Subscribe to table changes
const subscription = supabase
  .channel('table_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'table_name'
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### Presence
```typescript
// Track online users
const channel = supabase.channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online:', state);
  });
```

## Database Migrations

### Structure
```sql
-- 20250101000000_create_users.sql
begin;

create table users (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamptz default now(),
  email text unique not null,
  name text
);

-- Add policies
alter table users enable row level security;

create policy "Users can read own profile"
  on users for select
  using (auth.uid() = id);

commit;
```

### Migration Management
```bash
# Create migration
supabase migration new create_users

# Apply migrations
supabase db reset

# Generate types
supabase gen types typescript > types.ts
```

## Edge Functions

### Deployment
```typescript
// Function code
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { name } = await req.json();
  return new Response(
    JSON.stringify({ message: `Hello ${name}!` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

// Deploy
supabase functions deploy function-name
```

## Best Practices

### Error Handling
```typescript
const handleDatabaseOperation = async () => {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) {
    console.error('Error:', error.message);
    throw error;
  }

  return data;
};
```

### Type Safety
```typescript
// Define database types
type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? U : never;

// Use with queries
type Profile = DbResultOk<ReturnType<typeof getProfile>>;
```

### Performance
- Use appropriate indexes
- Optimize queries
- Implement caching strategies
- Use connection pooling
- Monitor query performance

### Security
- Always use RLS policies
- Implement proper auth flows
- Sanitize user inputs
- Use prepared statements
- Regular security audits

## Testing

### Database Tests
```typescript
import { createClient } from '@supabase/supabase-js';

describe('Database Operations', () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  beforeEach(async () => {
    // Setup test data
  });

  it('should create a record', async () => {
    const { data, error } = await supabase
      .from('test_table')
      .insert({ /* test data */ })
      .select();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
