# PSOHS Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install MongoDB

**Option A: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (select FREE tier)
4. Get your connection string
5. Update backend/.env.example with your connection string

### Step 2: Setup Backend .env

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`:
```
copy .env.example .env
```

3. Edit `.env` and update:
```
MONGODB_URI=mongodb://localhost:27017/psohs
# OR if using Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/psohs

JWT_SECRET=your_secret_key_here_change_this
```

### Step 3: Install Dependencies & Start Backend

```bash
# Open terminal in backend folder
cd backend

# Install dependencies
npm install

# Start server
npm run dev
```

✅ Backend running on **http://localhost:5000**

### Step 4: Start Frontend

```bash
# Open NEW terminal in frontend folder
cd frontend

# Dependencies already installed, just start
npm run dev
```

✅ Frontend running on **http://localhost:5173**

### Step 5: Access the Website

Open your browser and go to: **http://localhost:5173**

---

## 👤 Creating Admin Account

1. Go to http://localhost:5173/register
2. Create an account with your details
3. Open MongoDB (Compass or mongosh)
4. Run this command:

```javascript
db.users.updateOne(
  { email: "YOUR_EMAIL@example.com" },
  { $set: { role: "admin" } }
)
```

5. Logout and login again
6. You'll now have access to Admin Dashboard!

---

## 📋 What You Can Do

### As a Student:
✅ Browse programs and requirements  
✅ Register and login  
✅ Submit applications  
✅ Track application status  
✅ View dashboard  

### As an Admin:
✅ View all applications  
✅ Update application statuses  
✅ View contact messages  
✅ Monitor statistics  

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check your connection string in `.env`
- For local: should be `mongodb://localhost:27017/psohs`

### "Port 5000 already in use"
- Change `PORT=5001` in backend/.env
- Update frontend/.env to `VITE_API_URL=http://localhost:5001/api`

### "Network Error" in frontend
- Ensure backend is running
- Check frontend/.env has correct API URL
- Check CORS settings in backend/server.js

---

## 📞 Need Help?

Check the main README.md for detailed documentation!
