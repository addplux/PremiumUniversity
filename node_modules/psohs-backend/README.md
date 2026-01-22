# PSOHS Backend API

Backend API for Premium School of Health Sciences university platform built with Node.js, Express, and MongoDB.

## Features

- ✅ User Authentication (JWT)
- ✅ Student & Admin Roles  
- ✅ Online Application System
- ✅ Program Management
- ✅ Contact Form Management
- ✅ Document Upload Support
- ✅ RESTful API Design

## Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB installed and running OR MongoDB Atlas account

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your values
```

3. **Setup MongoDB:**

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service
- Use default connection: `mongodb://localhost:27017/psohs`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env

4. **Start the server:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/updateprofile` - Update profile (Protected)

### Applications
- `POST /api/applications` - Submit application (Protected)
- `GET /api/applications/my` - Get my applications (Protected)
- `GET /api/applications/:id` - Get single application (Protected)
- `GET /api/applications` - Get all applications (Admin)
- `PUT /api/applications/:id/status` - Update status (Admin)

### Programs
- `GET /api/programs` - Get all programs (Public)
- `GET /api/programs/:id` - Get single program (Public)
- `POST /api/programs` - Create program (Admin)
- `PUT /api/programs/:id` - Update program (Admin)

### Contact
- `POST /api/contact` - Submit contact form (Public)
- `GET /api/contact` - Get all messages (Admin)
- `PUT /api/contact/:id` - Update message (Admin)

## Default Admin Account

To create an admin account, register normally and then update the database:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "admin@psohs.ac.zm" },
  { $set: { role: "admin" } }
)
```

## Project Structure

```
backend/
├── models/           # Database models
├── routes/           # API routes
├── middleware/       # Custom middleware
├── uploads/          # File uploads directory
├── server.js         # Entry point
└── package.json      # Dependencies
```

## Technologies

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## Support

For issues or questions, contact: info@psohs.ac.zm
