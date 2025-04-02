---
name: Supabase Development
description: Expert knowledge for Supabase platform usage and best practices
type: knowledge
triggers: [supabase, postgresql, auth, storage, realtime, rpc, postgrest, database]
author: OpenHands
version: 1.0.0
---

# Supabase Guide

Essential patterns and practices for using Supabase in the Libro project.

## Client Setup

### Initialization
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

## Authentication

### User Management
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { 
    data: { full_name: name }
  }
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Get session
const { data: { session } } = await supabase.auth.getSession();
```

## Database Operations

### Queries
```typescript
// Select with filters
const { data, error } = await supabase
  .from('books')
  .select('id, title, author(*)')
  .eq('status', 'published')
  .order('created_at', { ascending: false });

// Insert with return
const { data, error } = await supabase
  .from('books')
  .insert({ title, author_id })
  .select()
  .single();

// Update with constraints
const { error } = await supabase
  .from('books')
  .update({ status: 'archived' })
  .eq('id', bookId)
  .eq('user_id', userId);
```

## Row Level Security

### Policy Examples
```sql
-- Enable RLS
alter table books enable row level security;

-- Read policy
create policy "Public books are viewable"
  on books for select
  using (status = 'published');

-- Write policy
create policy "Users can update own books"
  on books for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Storage

### File Operations
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('book-covers')
  .upload(`${userId}/${filename}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('book-covers')
  .getPublicUrl(filePath);

// Delete file
const { error } = await supabase.storage
  .from('book-covers')
  .remove([filePath]);
```

## Realtime Subscriptions

### Channel Setup
```typescript
const subscription = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'books' 
    },
    (payload) => {
      console.log('Change received:', payload);
    }
  )
  .subscribe();
```

## Error Handling

### Type-Safe Operations
```typescript
interface DatabaseError {
  code: string;
  message: string;
  details: string;
}

async function handleDatabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: DatabaseError | null; }>
): Promise<T> {
  const { data, error } = await operation();
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!data) {
    throw new Error('No data returned');
  }
  
  return data;
}
```

## Best Practices

### Security
- Enable RLS for all tables
- Use service roles sparingly
- Validate all inputs
- Use prepared statements
- Regular security audits

### Performance
- Index frequently queried columns
- Use appropriate joins
- Implement caching strategy
- Monitor query performance
- Batch operations

### Database Design
- Use UUIDs for primary keys
- Add timestamps to all tables
- Implement soft deletes
- Use foreign key constraints
- Document schema changes

### Error Management
- Handle network errors
- Implement retry logic
- Log database errors
- Validate responses
- Use type checking

### Development Flow
- Use migrations for changes
- Test in local environment
- Follow naming conventions
- Document API endpoints
- Monitor performance
