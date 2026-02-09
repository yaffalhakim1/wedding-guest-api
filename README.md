# Wedding Guest API

Backend API for Wedding Guest Manager with QR Scanner functionality.

## Features

- ✅ JWT Authentication for admin access
- ✅ Guest CRUD operations
- ✅ Real-time check-in system
- ✅ Dashboard statistics
- ✅ Public invitation pages
- ✅ SQLite database (lightweight & portable)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env` and update as needed (JWT_SECRET, PORT, etc.)

### 3. Initialize Database

```bash
npm run init-db
```

This creates the SQLite database with default admin:

- **Email**: `admin@wedding.com`
- **Password**: `admin123`

> ⚠️ **Change the default password after first login!**

### 4. Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication

#### `POST /api/auth/login`

Login admin user

```json
{
  "email": "admin@wedding.com",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "admin@wedding.com"
  }
}
```

#### `POST /api/auth/verify` (Protected)

Verify JWT token validity

- **Headers**: `Authorization: Bearer <token>`

### Guests (All Protected)

#### `GET /api/guests`

Get all guests

- **Query params**: `search`, `isVIP`

#### `GET /api/guests/stats`

Get dashboard statistics

#### `GET /api/guests/:id`

Get single guest

#### `POST /api/guests`

Create new guest

```json
{
  "name": "John Doe",
  "isVIP": false
}
```

#### `PUT /api/guests/:id`

Update guest

#### `DELETE /api/guests/:id`

Delete guest

#### `POST /api/guests/:id/check-in`

Mark guest as checked-in

### Config

#### `GET /api/config` (Public)

Get wedding configuration

#### `PUT /api/config` (Protected)

Update wedding configuration

### Invitation (Public)

#### `GET /api/invitation/:guestId`

Get guest invitation details (for QR display)

## Database Schema

```sql
-- admins
id, email, password_hash, created_at

-- guests
id, name, is_vip, checked_in, checked_in_at, created_at

-- event_config (single row)
id, bride, groom, date, time, venue, message, updated_at
```

## Deployment

### VPS Deployment

1. Install Node.js (v18+)
2. Clone repository
3. Install dependencies: `npm install --production`
4. Setup environment: Create `.env` with production values
5. Initialize database: `npm run init-db`
6. Use PM2 for process management:

   ```bash
   npm install -g pm2
   pm2 start src/server.js --name wedding-api
   pm2 save
   pm2 startup
   ```

7. (Optional) Setup Nginx reverse proxy:
   ```nginx
   location /api {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

## Environment Variables

```env
PORT=5000
DATABASE_PATH=./database.db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
```

## Security

- JWT tokens expire after 7 days (configurable)
- Passwords hashed with bcrypt (10 rounds)
- CORS restricted to frontend origin
- SQL injection prevention via parameterized queries
- Protected routes require valid JWT

## Tech Stack

- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin support

## License

MIT
