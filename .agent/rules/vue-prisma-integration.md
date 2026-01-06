---
trigger: always_on
---

Prisma-Vue Integration

---

description: Prisma with Vue.js Integration Setup Guide
globs: **/\*.vue, **/_.ts, \*\*/_.js
alwaysApply: false

---

# Prisma with Vue.js Integration Setup Guide

This guide provides step-by-step instructions for integrating Prisma ORM with a Vue.js application.

## Prerequisites

- Node.js and npm installed
- Vue.js project initialized
- PostgreSQL database (or any other supported database)

## Installation

1. Install Prisma and its dependencies:

```bash
npm install @prisma/client
npm install -D prisma
```

2. Initialize Prisma in your project:

```bash
npx prisma init
```

## Database Schema

1. Define your schema in `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## API Service Setup

1. Create a Prisma service file `src/services/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

2. Create a users service `src/services/users.ts`:
