# Elysia Template V4

## Description

RESTFUL API PROJECT TEMPLATE WITH BUN ELYSIA AND TYPEORM.

## Tech Stack

- **Bun** - Runtime and package manager
- **Elysia** - Web framework
- **TypeORM** - ORM for database operations
- **PostgreSQL** - Database

Read docs about these techstacks to understand how to use them.

## Development

### Setup

1. Install dependencies:

```bash
bun install
```

1. Create `.env.development` file and update the database connection URL:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
```

1. Run the application:

```bash
bun dev
```

The application will run on `http://localhost:3000` and Swagger UI will be available at `http://localhost:3000/swagger-ui`.

## Production

### Running in Production Mode

For production development (using `.env.production`):

```bash
bun run dev:prod
```

Note: `.env.production` is ignored from git for security.

### Production Build

Set environment and start:

```bash
export NODE_ENV=production && bun start
```

Or build and run Docker container:

```bash
docker build -t hyra-mega-api .
docker run -p 3000:3000 hyra-mega-api
```

## Project Structure

```text
src/
├── controllers/     # Route definitions
├── services/        # Business logic that controllers call
├── middlewares/    # Middleware logic (error responses, success responses)
├── macros/         # Special middleware for authentication and authorization
├── entity/         # TypeORM entity classes
├── types.ts        # Global type definitions
├── ultis.ts        # Global utility functions
├── data-source.ts  # TypeORM configuration
├── db.ts           # Centralized repository management
└── index.ts        # Application entry point
```

## Key Patterns and Conventions

### Services Pattern

Services can be exported as Elysia decorators, but for easier cross-service imports, export service classes normally and instantiate them in controllers using the `new` keyword. If you need a singleton pattern, add it to the service class.

**Example:**

```typescript
// services/UserService.ts
export class UserService {
  async register(username: string, password: string) {
    // business logic
  }
}

// controllers/user.controller.ts
import UserService from "../services/UserService";
const userService = new UserService();
```

### Global Error Handling

Global try-catch is implemented in `src/middlewares/errorMiddleware.ts`, so you don't need to wrap every function with try-catch. Simply throw errors and they will be caught automatically.

**Example:**

```typescript
// ❌ Bad - Don't use try-catch
try {
  // code
} catch (e) {
  // handle error
}

// ✅ Good - Just throw errors
throw new Error("User not found");
```

### Global Response Middleware

Global response formatting is handled in `src/middlewares/responseMiddleware.ts`. You don't need to wrap your return values in a response object - just return the data directly.

**Example:**

```typescript
// ❌ Bad
return {
  data: {
    name: "LilHuy",
  },
};

// ✅ Good
return {
  name: "LilHuy",
};
```

### Repository Management

All repositories are centrally managed in `src/db.ts` as a single source of truth. When adding new entities:

1. Define the entity class in the `entity/` folder
1. Add the repository to `db.ts`
1. Use `getRepository()` to access repositories in services

This ensures repositories are created only once for the entire runtime.

**Example:**

```typescript
// db.ts
export interface IRepository {
  user: Repository<User>;
  // Add new repositories here
}

// services/UserService.ts
import { getRepository } from "../db";
const userRepository = getRepository().user;
```

## API Response Format

### Success Response

All successful API responses follow this format is the json of the return result of controller functions
```

The response middleware automatically wraps your return value, so just return the data directly.

### Error Response

All errors follow this format:

```json
{
  "message": "Error message",
  "status": 400
}
```

Elysia automatically catches all errors and responds to the client. Use `throw new Error()` instead of try-catch blocks.

**Example:**

```typescript
// This will automatically respond to client:
throw new Error("User not found");
// Response: { "message": "User not found", "status": 400 }
```

## Authentication & Authorization

### Authentication Setup

1. Add the `authMacro` middleware to your route group:

```typescript
import authMacro from "../macros/auth";

const userController = new Elysia().group(
  "/users",
  (group) => group.use(authMacro)
  // routes...
);
```

1. Add `checkAuth` to protected routes:

```typescript
.get("/me", async ({user}) => {
  return user
}, {
  checkAuth: ['user'], // or ['admin'] for admin-only routes
  detail: {
    tags: ["User"],
    security: [
      {JwtAuth: []}
    ],
  },
})
```

### Accessing Logged-in User

Access the logged-in user in request context by destructuring `{user}`:

```typescript
.get("/me", async ({user}) => {
  // user contains { id, role }
  return user
})
```

### Swagger UI Documentation

For routes that require authentication, add the security scheme in the route detail:

```typescript
detail: {
  tags: ["User"],
  security: [
    {JwtAuth: []}
  ],
}
```

## Adding New Entities

1. **Define the entity class** in `src/entity/`:

```typescript
// entity/Product.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

1. **Add repository to `db.ts`**:

```typescript
import { Product } from "./entity/Product";

export interface IRepository {
  user: Repository<User>;
  product: Repository<Product>; // Add here
}

export const getRepository = () => {
  if (repository) return repository;

  repository = {
    user: AppDataSource.getRepository(User),
    product: AppDataSource.getRepository(Product), // Add here
  };

  return repository;
};
```

1. **Use in services**:

```typescript
import { getRepository } from "../db";
const productRepository = getRepository().product;
```

## Notes

- The project uses TypeORM with `synchronize: true` in development (auto-syncs schema)
- JWT authentication is used for protected routes
- All routes are prefixed with `/api` except the root route
- Swagger UI is available at `/swagger-ui` for API documentation
