# TypeScript Development Knowledge

## Keywords
typescript, ts, tsx, type, interface, enum, generic, union, intersection, keyof, typeof, infer

## Overview
Expert in TypeScript development, type systems, and best practices for type-safe JavaScript applications.

## Type System Fundamentals

### Basic Types
```typescript
// Primitive types
const str: string = "hello";
const num: number = 42;
const bool: boolean = true;

// Arrays
const arr: string[] = ["a", "b"];
const nums: Array<number> = [1, 2, 3];

// Tuples
const tuple: [string, number] = ["age", 25];

// Objects
const obj: { id: number; name: string } = { id: 1, name: "John" };
```

### Advanced Types

#### Interfaces
```typescript
interface User {
  id: number;
  name: string;
  email?: string;  // Optional property
  readonly createdAt: Date;  // Immutable property
}

// Extending interfaces
interface Employee extends User {
  department: string;
  salary: number;
}
```

#### Type Aliases
```typescript
type ID = string | number;
type Status = "pending" | "approved" | "rejected";
type Callback<T> = (data: T) => void;
```

#### Generics
```typescript
// Generic function
function identity<T>(arg: T): T {
  return arg;
}

// Generic interface
interface Repository<T> {
  find(id: string): Promise<T>;
  save(item: T): Promise<void>;
}

// Generic constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Best Practices

### Type Inference
- Let TypeScript infer types when obvious
- Explicitly declare types for function parameters
- Use type annotations for complex objects

### Null Handling
```typescript
// Use strict null checks
function processUser(user: User | null): string {
  if (!user) {
    throw new Error("User not found");
  }
  return user.name;  // TypeScript knows user is not null
}
```

### Type Guards
```typescript
// User-defined type guards
function isString(value: unknown): value is string {
  return typeof value === "string";
}

// instanceof type guard
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

### Utility Types
```typescript
// Partial - makes all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserCredentials = Pick<User, "email" | "password">;

// Omit - remove specific properties
type PublicUser = Omit<User, "password">;

// Record - create object type with specific key/value types
type UserRoles = Record<string, "admin" | "user">;
```

## Common Patterns

### Factory Pattern
```typescript
interface Product {
  name: string;
  price: number;
}

class ProductFactory {
  static create<T extends Product>(type: string): T {
    // Implementation
  }
}
```

### Builder Pattern
```typescript
class RequestBuilder {
  private request: Partial<Request> = {};

  setMethod(method: string): this {
    this.request.method = method;
    return this;
  }

  setUrl(url: string): this {
    this.request.url = url;
    return this;
  }

  build(): Request {
    return this.request as Request;
  }
}
```

## Error Handling
```typescript
// Custom error types
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Result type
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};
```

## Module System
```typescript
// Named exports
export interface Config {}
export function configure() {}

// Default export
export default class Service {}

// Type-only imports
import type { Config } from "./types";
```

## Async Programming
```typescript
// Promise types
async function fetchData<T>(): Promise<T> {
  const response = await fetch("api/data");
  return response.json();
}

// Error handling
async function safeRequest<T>(): Promise<Result<T, Error>> {
  try {
    const data = await fetchData<T>();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
```

## Testing Types
```typescript
// Type assertion tests
type test = Expect<Equal<typeof result, ExpectedType>>;

// Type predicates in tests
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Not a string");
  }
}
```

## Configuration
- Enable strict mode
- Use ESLint with @typescript-eslint
- Configure paths for module resolution
- Set appropriate target and lib options
- Enable source maps for debugging
