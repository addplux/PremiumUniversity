# PSOHS - Premium School of Health Sciences
Complete University Management Platform

A full-stack web application for university management including student portal, online applications, program information, and admin dashboard.

## 🚀 Tech Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads
- Nodemailer for email notifications

**Frontend:**
- React 19
- React Router for navigation
- Axios for API calls
- Context API for state management
- Modern CSS with animations

## 📁 Project Structure

```
Premiumuni/
├── backend/          # Express API server
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── server.js     # Entry point
├── frontend/         # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Auth context
│   │   └── main.jsx      # Entry point
│   └── index.html
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MongoDB installed and running (or MongoDB Atlas account)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
# Copy the example env file
copy .env.example .env

# Edit .env and add your values:
# - MongoDB connection string
# - JWT secret key
# - Email configuration (optional)
```

4. **Start MongoDB** (if using local):
- Windows: MongoDB should autostart as service
- Or run: `mongod`

5. **Start backend server:**
```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

Backend will run on **http://localhost:5000**

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies** (already done):
```bash
npm install
```

3. **Configure environment:**
```bash
# Create .env file (already created)
# Should contain:
VITE_API_URL=http://localhost:5000/api
```

4. **Start development server:**
```bash
npm run dev
```

Frontend will run on **http://localhost:5173**

## 🚀 Running the Application

1. **Start MongoDB** (if using local installation)

2. **Start Backend** (in first terminal):
```bash
cd backend
npm run dev
```

3. **Start Frontend** (in second terminal):
```bash
cd frontend
npm run dev
```

4. **Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 👤 Creating Admin Account

1. Register a normal account through the UI
2. Access MongoDB and update the user role:

```javascript
// Using MongoDB Compass or mongosh
db.users.updateOne(
  { email: "admin@psohs.ac.zm" },
  { $set: { role: "admin" } }
)
```

## 📱 Features

### Public Website
- ✅ Homepage with university information
- ✅ Programs page with entry requirements
- ✅ Admissions information
- ✅ Student life gallery
- ✅ Contact form
- ✅ About page

### Student Portal
- ✅ User registration and login
- ✅ Dashboard with application tracking
- ✅ Profile management
- ✅ Online application submission

### Admin Dashboard
- ✅ View all applications
- ✅ Update application statuses
- ✅ View contact messages
- ✅ Statistics overview

## 🔑 Default Test Credentials

After creating an account and setting it as admin:
- **Email:** admin@psohs.ac.zm
- **Password:** (what you set during registration)

## 📸 Assets

University photos are integrated from:
- C:/Users/flyst/.gemini/antigravity/brain/70241dd5-b90c-44e6-af60-d66cfb9fe4bc/

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/my` - Get my applications
- `GET /api/applications` - Get all (Admin)
- `PUT /api/applications/:id/status` - Update status (Admin)

### Programs
- `GET /api/programs` - Get all programs

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get messages (Admin)

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For local: use `mongodb://localhost:27017/psohs`
- For Atlas: use your connection string

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `vite.config.js`

### CORS Errors
- Ensure backend `FRONTEND_URL` matches frontend URL
- Check CORS configuration in `backend/server.js`

## 📦 Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
# Outputs to dist/ folder
```

## 🎓 Programs Offered

1. **Registered Nursing** - 3 Years Diploma
2. **Clinical Medicine** - 3 Years Diploma
3. **Environmental Health Technologist** - 3 Years Diploma
4. **EN to RN Abridged** - 2 Years Bridging Program

## 📞 Support

For support, email info@psohs.ac.zm

## 📄 License

© 2026 Premium School of Health Sciences. All rights reserved.
