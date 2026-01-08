# Deployment Guide for PSOHS Platform

## Option 1: Railway (Easiest "All-in-One")
Railway is great because it can host your Backend, Frontend, and Database all in one project.

### 1. Setup Database & Backend
1. Create a [Railway](https://railway.app/) account.
2. Create a **New Project** > **Provision MongoDB**.
3. Click on the MongoDB service > **Connect** tab.
4. Copy the **Mongo Connection URL**.
   * *Tip: You can use this URL in your local `.env` file to skip installing MongoDB locally!*
5. In your project, click **New** > **GitHub Repo** > Select your repo.
6. Configure the Backend service:
   * **Root Directory:** `backend`
   * **Variables:** Add all variables from your `backend/.env` file.
   * Set `frontent_URL` to your future frontend domain (or `*` for now).

### 2. Setup Frontend
1. In the same project, click **New** > **GitHub Repo** > Select repo again.
2. Configure the Frontend service:
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Start Command:** `npm run preview` (or serve `dist` folder)
   * **Variables:** `VITE_API_URL` = Your Railway Backend URL.

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
