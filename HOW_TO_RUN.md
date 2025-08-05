# How to Run ProspectPilot API

This guide will walk you through setting up and running the ProspectPilot API locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

### Check Your Versions

```bash
node --version
npm --version
psql --version
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Solomon198/ProspectPilot.git
cd ProspectPilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/prospectpilot"

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MAIN_MODEL=gpt-4o
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo

# People Data Labs Configuration
PDL_API_KEY=your_pdl_api_key_here

# Security Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name prospectpilot-db \
  -e POSTGRES_DB=prospectpilot \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update your DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/prospectpilot"
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE prospectpilot;
   CREATE USER prospectpilot_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE prospectpilot TO prospectpilot_user;
   ```
3. Update your `DATABASE_URL` in `.env`

### 5. Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with TOV configurations
npx prisma db seed
```

### 6. Start the Development Server

```bash
# Start in development mode with hot reload
npm run dev

# Or start in production mode
npm start
```

The API will be available at `http://localhost:3000`

## 🔧 Configuration Details

### Environment Variables

| Variable                | Description                  | Required | Default               |
| ----------------------- | ---------------------------- | -------- | --------------------- |
| `PORT`                  | Server port                  | No       | 3000                  |
| `NODE_ENV`              | Environment mode             | No       | development           |
| `DATABASE_URL`          | PostgreSQL connection string | Yes      | -                     |
| `OPENAI_API_KEY`        | OpenAI API key               | Yes      | -                     |
| `OPENAI_MAIN_MODEL`     | Primary AI model             | No       | gpt-4o                |
| `OPENAI_FALLBACK_MODEL` | Fallback AI model            | No       | gpt-3.5-turbo         |
| `PDL_API_KEY`           | People Data Labs API key     | Yes      | -                     |
| `CORS_ORIGIN`           | Allowed CORS origins         | No       | http://localhost:3000 |

### API Keys Setup

#### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

#### People Data Labs API Key

1. Go to [People Data Labs](https://www.peopledatalabs.com/)
2. Sign up for an account
3. Navigate to your API keys
4. Copy your API key to your `.env` file

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Generate a Sales Sequence

```bash
curl -X POST http://localhost:3000/api/generate-sequence \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_url": "https://linkedin.com/in/john-doe",
    "tov_config": {
      "formality": 0.8,
      "warmth": 0.6,
      "directness": 0.7
    },
    "company_context": "We help SaaS companies automate sales",
    "sequence_length": 3
  }'
```

## 📊 Database Management

### View Database Schema

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Reset Database

```bash
# Reset database and run migrations
npx prisma migrate reset

# Seed the database
npx prisma db seed
```

### View Database Logs

```bash
# Check migration status
npx prisma migrate status

# View database logs
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error**: `ECONNREFUSED` or `password authentication failed`

**Solution**:

- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists and user has permissions

```bash
# Test database connection
psql "postgresql://username:password@localhost:5432/prospectpilot"
```

#### 2. Prisma Client Not Generated

**Error**: `PrismaClient is not generated`

**Solution**:

```bash
npx prisma generate
```

#### 3. Migration Errors

**Error**: `Migration failed`

**Solution**:

```bash
# Reset and recreate migrations
npx prisma migrate reset
npx prisma migrate dev --name init
```

#### 4. API Key Errors

**Error**: `Invalid API key` or `401 Unauthorized`

**Solution**:

- Verify API keys in `.env` file
- Check API key permissions
- Ensure keys are not expired

#### 5. Port Already in Use

**Error**: `EADDRINUSE`

**Solution**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev
```

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show:

- SQL queries
- API request/response logs
- Error stack traces

## 🚀 Production Deployment

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Environment Setup

For production, ensure:

1. **Database**: Use managed PostgreSQL service
2. **Environment**: Set `NODE_ENV=production`
3. **Logging**: Configure external logging service
4. **Security**: Use strong passwords and HTTPS
5. **Monitoring**: Set up health checks and alerts

### Docker Deployment

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [People Data Labs Documentation](https://docs.peopledatalabs.com/)
- [Express.js Documentation](https://expressjs.com/)

## 🤝 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in your terminal
3. Check the [main README](../README.md) for architecture details
4. Open an issue in the repository

## 📝 Development Workflow

### Making Changes

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Check types: `npm run type-check`
5. Submit a pull request

### Code Quality

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm test
```

---

**Happy coding! 🚀**
