# ProspectPilot API

A modern Node.js API built with Express, TypeScript, Prisma ORM, and comprehensive validation.

## Features

- 🚀 **Express.js** - Fast, unopinionated web framework
- 🔷 **TypeScript** - Type-safe JavaScript
- 🗄️ **Prisma ORM** - Type-safe database client
- 🐘 **PostgreSQL** - Robust relational database
- ✅ **Express Validator** - Request validation middleware
- 🛡️ **Zod** - TypeScript-first schema validation
- 🔒 **Security** - Helmet, CORS, rate limiting
- 📝 **Logging** - Structured logging with levels
- 🧪 **Testing** - Jest with TypeScript support
- 📊 **Error Handling** - Comprehensive error management
- 🔄 **Async/Await** - Modern async error handling

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ProspectPilot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your database credentials:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/prospect_pilot?schema=public"
   PORT=3000
   NODE_ENV=development
   LOG_LEVEL=info
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Run migrations
   npm run db:migrate

   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Users

- `GET /api/v1/users` - Get all users (with pagination)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search in name and email fields

## Request/Response Examples

### Create User

```bash
POST /api/v1/users
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

Response:

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clx1234567890abcdef",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Users with Pagination

```bash
GET /api/v1/users?page=1&limit=5&search=john
```

Response:

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 10,
      "totalPages": 2
    }
  }
}
```

## Validation

The API uses both **Express Validator** and **Zod** for comprehensive validation:

### Express Validator

- Email format validation
- String length validation
- Custom regex patterns
- Parameter validation

### Zod Schemas

- Type-safe schema validation
- Automatic type inference
- Complex validation rules
- Error message customization

## Error Handling

The API provides comprehensive error handling:

- **400** - Bad Request (validation errors)
- **404** - Not Found (resource not found)
- **409** - Conflict (duplicate resources)
- **500** - Internal Server Error

Error Response Format:

```json
{
  "success": false,
  "message": "Error description",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling
- **Input Validation** - Comprehensive validation
- **SQL Injection Protection** - Prisma ORM

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Posts Table

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  author_id TEXT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Development

### Project Structure

```
src/
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── schemas/         # Zod validation schemas
├── utils/           # Utility functions
├── lib/             # Library configurations
├── __tests__/       # Test files
└── index.ts         # Application entry point
```

### Adding New Routes

1. Create a new controller in `src/controllers/`
2. Create validation schemas in `src/schemas/`
3. Create routes in `src/routes/`
4. Add routes to `src/routes/index.ts`

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set environment variables**

   ```env
   NODE_ENV=production
   DATABASE_URL=your_production_database_url
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
