# Collaborative Form Builder with Real-time Editing

## Overview

A Google Forms-like application with real-time collaborative form filling, robust access control, and dynamic form structures. Combines SQL and NoSQL databases for optimal performance.

## Key Features

- **Real-time collaboration** - Multiple users can edit forms simultaneously
- **Field-level locking** - Prevent conflicts with visual indicators
- **Role-based access** - OWNER, EDITOR, and VIEWER roles
- **Hybrid database** - PostgreSQL for metadata, MongoDB for form data
- **WebSocket integration** - Instant updates across all clients

## Technology Stack

| Component      | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | React, TailwindCSS, Socket.IO-client |
| Backend        | Node.js, Express                     |
| Databases      | PostgreSQL, MongoDB, Redis           |
| ORM            | Prisma                               |
| Authentication | JWT                                  |

## Installation

### Prerequisites

- Node.js v16+
- PostgreSQL
- MongoDB
- Redis

### Setup

1. Clone the repository:

```bash
git clone https://github.com/your-repo/form-builder.git
cd form-builder
```

2. Install dependencies:

```bash
npm install
cd frontend && npm install
```

3. Set up environment variables:

```env
# .env
DATABASE_URL="postgresql://user:password@host:port/database"
MONGO_URI="mongodb+srv://user:password@cluster.mongodb.net/database"
JWT_SECRET="your_jwt_secret_here"
REDIS_URL="redis://localhost:6379"
```

4. Run the application:

```bash
# Start backend
npm run dev

# In another terminal
cd frontend && npm start
```

## API Documentation

### Authentication

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secret123"
}
```

### Forms

#### Get User's Forms

```http
GET /api/forms
Authorization: Bearer <token>
```

#### Get Form Structure

```http
GET /api/forms/:formId/structure
Authorization: Bearer <token>
```

#### Submit Response

```http
POST /api/forms/:formId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": {
    "field-1": "Response 1",
    "field-2": "Response 2"
  }
}
```

## WebSocket Events

**Namespace: **``

### Client → Server

| Event          | Payload                               | Description             |
| -------------- | ------------------------------------- | ----------------------- |
| `join_form`    | `{ formId: string, userId: string }`  | Join form collaboration |
| `lock_field`   | `{ fieldId: string, userId: string }` | Lock a specific field   |
| `unlock_field` | `{ fieldId: string }`                 | Release field lock      |
| `update_field` | `{ fieldId: string, value: any }`     | Update field value      |

### Server → Client

| Event            | Payload                         | Description                  |
| ---------------- | ------------------------------- | ---------------------------- |
| `init_state`     | `{ answers: {}, locks: {} }`    | Initial form state           |
| `field_locked`   | `{ fieldId, userId, userName }` | Notification of field lock   |
| `field_unlocked` | `{ fieldId }`                   | Notification of field unlock |
| `field_updated`  | `{ fieldId, value }`            | Field value update broadcast |

## Database Models

### PostgreSQL (Prisma)

```prisma
model User {
  id            String       @id @default(uuid())
  email         String       @unique
  name          String
  password_hash String
  created_at    DateTime     @default(now())
  formAccess    FormAccess[]
  createdForms  Form[]       @relation("Creator")
}

model Form {
  id         String       @id @default(uuid())
  title      String
  createdBy  String
  createdAt  DateTime     @default(now())
  creator    User         @relation("Creator", fields: [createdBy], references: [id])
  access     FormAccess[]
}

model FormAccess {
  id     String   @id @default(uuid())
  userId String
  formId String
  role   FormRole
  user   User     @relation(fields: [userId], references: [id])
  form   Form     @relation(fields: [formId], references: [id])

  @@unique([userId, formId])
}
```

## Redis Configuration

- **Key format**: `lock:{formId}:{fieldId}`
- **Value**: `{ userId, userName }`
- **TTL**: 60 seconds (auto-unlock)
- **Notifications**: Key expiry events trigger automatic unlocking


