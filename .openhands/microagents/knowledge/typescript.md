---
name: TypeScript Development
description: Expert knowledge for TypeScript development and type system usage
type: knowledge
triggers: [typescript, ts, tsx, type, interface, enum, generic, union, keyof]
author: OpenHands
version: 1.0.0
---

# TypeScript Guide

Essential TypeScript patterns and best practices for the Libro project.

## Type System Fundamentals

### Basic Type Declarations
```typescript
// Primitive types
const id: number = 1;
const title: string = "Book Title";
const isPublished: boolean = true;

// Arrays and tuples
const tags: string[] = ["fiction", "fantasy"];
const coordinate: [number, number] = [0, 0];

// Objects and interfaces
interface Book {
  id: number;
  title: string;
  author?: string;  // Optional property
  readonly publishedAt: Date;  // Immutable
}
```

### Advanced Types

#### Union & Intersection
```typescript
// Union types
type Status = "draft" | "published" | "archived";
type ID = string | number;

// Intersection types
type AdminUser = User & {
  permissions: string[];
  role: "admin";
};
```

#### Generics
```typescript
// Generic interface
interface Repository<T> {
  find(id: string): Promise<T>;
  save(item: T): Promise<void>;
}

// Generic function
function pickProps<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => result[key] = obj[key]);
  return result;
}
```

## Type Safety

### Type Guards
```typescript
// User-defined type guard
function isBook(value: unknown): value is Book {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

// Assertion functions
function assertIsBook(value: unknown): asserts value is Book {
  if (!isBook(value)) {
    throw new Error("Not a book");
  }
}
```

### Utility Types
```typescript
// Common utility types
type PartialBook = Partial<Book>;
type ReadonlyBook = Readonly<Book>;
type BookPreview = Pick<Book, "id" | "title">;
type BookWithoutId = Omit<Book, "id">;

// Record type
type BooksByID = Record<string, Book>;
```

## Error Handling

### Result Type Pattern
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

function handleResult<T>(result: Result<T>): T {
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
```

### Async Operations
```typescript
// Async function with type safety
async function fetchBook(id: string): Promise<Result<Book, Error>> {
  try {
    const response = await api.get(`/books/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
```

## Best Practices

### Type Inference
- Let TypeScript infer simple types
- Explicitly declare complex types
- Use const assertions where helpful
- Leverage type narrowing

### Naming Conventions
- Types/Interfaces: PascalCase
- Generic type params: PascalCase
- Variables/Functions: camelCase
- Enum members: PascalCase

### Code Organization
- Group related types together
- Export types from separate files
- Use barrel exports for types
- Keep type definitions close to usage

### Type Safety Rules
- Enable strict mode
- Avoid type assertions
- Use unknown over any
- Implement proper guards
- Handle null/undefined

### Documentation
- Document complex types
- Include examples
- Note breaking changes
- Explain type parameters
- Document constraints
