# Deployment Guide for PSOHS Platform

## Option 1: Railway (Recommended - Step-by-Step)
Railway is the easiest way because it handles everything (Code + Database) in one dashboard.

### Phase 1: Create the Project
1. Go to [Railway.app](https://railway.app/) and **Login with GitHub**.
2. Click **+ New Project**.
3. Select **Deploy from GitHub repo**.
4. Select your repository: `PremiumUniversity`.
5. Click **Add Variables** later, just click **Deploy Now** (it might fail initially, that's fine).

### Phase 2: Configure the Backend
1. Click on the card that appeared (it represents your repo).
2. Go to **Settings** > **Root Directory**.
3. Change it to: `/backend`  (This is critical!).
4. Go to **Variables** tab. Add these:
   - `PORT`: `5000`
   - `JWT_SECRET`: (Create a random secret password)
   - `Node_ENV`: `production`
5. Go to **Settings** > **Networking** > **Generate Domain**.
   - Copy this URL (e.g., `backend-production.up.railway.app`).

### Phase 3: Add the Database
1. Click **+ New** (top right) > **Database** > **MongoDB**.
2. Wait for it to initialize.
3. Click on the **MongoDB** card > **Connect** tab.
4. Copy the **MONGO_URI**.
5. Go back to your **Backend Service** > **Variables**.
6. Add `MONGO_URI` and paste the value you copied.
7. The Backend should now redeploy and say "Success".

### Phase 4: Configure the Frontend
1. Click **+ New** > **GitHub Repo**.
2. Select `PremiumUniversity` AGAIN.
3. Click on this NEW card (this will be your frontend).
4. Go to **Settings** > **Root Directory**.
5. Change it to: `/frontend`
6. Go to **Variables** tab. Add:
   - `VITE_API_URL`: Paste the Backend URL from Phase 2 (e.g., `https://backend-production.up.railway.app/api`)
     *IMPORTANT: Make sure to add `/api` at the end!*
7. Go to **Settings** > **Networking** > **Generate Domain**.
8. Click that link - Your Website is LIVE! 🚀

---

## Option 2: The "Pro" Stack (Vercel + Atlas + Render/Railway)
This is the industry standard for React apps: Vercel for Frontend, Atlas for DB, functionality is separated.

### 1. Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster.
3. In **Network Access**, allow IP `0.0.0.0/0` (allows connections from anywhere).
4. Get your connection string.

### 2. Backend (Render or Railway)
1. Deploy the `backend` folder to **Render** (free tier available) or **Railway**.
2. Add your environment variables (MongoDB URI, JWT Secret).

### 3. Frontend (Vercel)
1. Install Vercel CLI or go to Vercel Dashboard.
2. Import your Git repo.
3. Set **Framework Preset** to `Vite`.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variable:
   * `VITE_API_URL` = Your deployed Backend URL.
6. Deploy!

---

## ⚡ How to Develop LOCALLY using Cloud Database

If you don't want to install MongoDB on your laptop:

1. Create the database on **Railway** or **MongoDB Atlas** (as above).
2. Copy the **Connection String** (starts with `mongodb+srv://...`).
3. Open your local `backend/.env` file.
4. Paste it:
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.railway.app:1234
   ```
5. Run `npm run dev` in your backend folder.

Now your local code is saving data directly to the cloud! ☁️
