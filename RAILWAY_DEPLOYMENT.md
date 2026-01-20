# Railway Deployment Guide for PremiumUniversity

This guide will walk you through deploying your PremiumUniversity application to Railway.

## Prerequisites

1. A [Railway](https://railway.app) account (sign up with GitHub)
2. Your code pushed to a GitHub repository
3. MongoDB Atlas account (for database) or use Railway's MongoDB

## Deployment Steps

### 1. Prepare Your Application

#### Backend Configuration

Create a `railway.json` file in your **backend** directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Ensure your `backend/package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### Frontend Configuration

Create a `railway.json` file in your **frontend** directory:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Update your `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port $PORT"
  }
}
```

### 2. Set Up MongoDB

You have two easy options for the database:

**Option A: Use Railway's Integrated MongoDB (Fastest)**

1. Open your project in Railway.
2. Click **+ New** (or "Add a Service").
3. Select **Database** -> **MongoDB**.
4. Railway will create a new MongoDB service for you.
5. Once created, click on the MongoDB service.
6. Go to the **Connect** tab.
7. Copy the **Mongo Connection URL** (e.g., `mongodb://mongo:password@containers...`).
8. You will use this as your `MONGODB_URI` in the backend variables.

**Option B: Use MongoDB Atlas (External)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Railway access
5. Get your connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/premiumuni?retryWrites=true&w=majority
   ```

### 3. Deploy Backend to Railway

1. **Go to [Railway Dashboard](https://railway.app/dashboard)**

2. **Click "New Project"** → **"Deploy from GitHub repo"**

3. **Select your repository** (PremiumUniversity)

4. **Add Backend Service:**
   - Click "+ New"
   - Select "GitHub Repo"
   - Choose your repository
   - **CRITICAL:** Click "Settings" → "Root Directory" and set it to `/backend`
   - *If you don't do this, Railway will try to build from the root and fail with "Script start.sh not found"*
   - Railway will auto-detect it's a Node.js app

5. **Configure Environment Variables:**
   
   Click on your backend service → **Variables** tab → Add these:

   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```

   **Important:** You'll get the `FRONTEND_URL` after deploying the frontend in the next step.

6. **Deploy:**
   - Railway will automatically build and deploy
   - Once deployed, copy the backend URL (e.g., `https://your-backend.railway.app`)

### 4. Deploy Frontend to Railway

1. **In the same Railway project, click "+ New"**

2. **Select "GitHub Repo"** again

3. **Choose your repository** and set:
   - **Root Directory**: `frontend`

4. **Configure Environment Variables:**
   
   Click on your frontend service → **Variables** tab → Add:

   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```

   Replace `your-backend.railway.app` with the actual backend URL from step 3.6

5. **Generate Domain:**
   - Go to **Settings** tab
   - Under **Networking**, click **Generate Domain**
   - Copy this URL

6. **Update Backend CORS:**
   - Go back to your **backend service**
   - Update the `FRONTEND_URL` variable with the frontend URL you just generated

### 5. Configure Custom Domains (Optional)

1. In Railway, go to your service → **Settings** → **Networking**
2. Click **Custom Domain**
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update your DNS records as instructed by Railway

### 6. Environment Variables Reference

#### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://app.railway.app` |

#### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.railway.app` |

### 7. Verify Deployment

1. Visit your frontend URL
2. Try to register/login
3. Check if API calls are working
4. Monitor logs in Railway dashboard

### 8. Monitoring & Logs

- **View Logs:** Click on your service → **Deployments** → Click on latest deployment
- **Metrics:** Railway provides CPU, Memory, and Network metrics
- **Alerts:** Set up alerts in Railway settings

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `FRONTEND_URL` in backend matches your actual frontend URL
- Check `backend/server.js` CORS configuration

**2. MongoDB Connection Failed**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

**3. Build Failures**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**4. Environment Variables Not Working**
- Variables must be set before deployment
- Redeploy after adding/changing variables
- Check variable names (case-sensitive)

**5. Frontend Can't Connect to Backend**
- Verify `VITE_API_URL` is correct
- Check backend is running (visit backend URL)
- Inspect browser console for errors

### Useful Railway Commands

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# View logs
railway logs

# Run commands in Railway environment
railway run npm start
```

## Continuous Deployment

Railway automatically deploys when you push to your GitHub repository:

1. Make changes locally
2. Commit and push to GitHub
3. Railway detects changes and redeploys automatically

## Cost Optimization

- **Free Tier:** Railway offers $5 free credit per month
- **Monitor Usage:** Check your usage in Railway dashboard
- **Optimize Resources:** Use environment variables to control resource usage

## Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use strong JWT secrets** (generate with: `openssl rand -base64 32`)
3. **Enable MongoDB authentication**
4. **Use HTTPS** (Railway provides this automatically)
5. **Regularly update dependencies**

## Next Steps

1. Set up a custom domain
2. Configure email service (for notifications)
3. Set up file storage (AWS S3, Cloudinary)
4. Implement monitoring (Sentry, LogRocket)
5. Set up automated backups for MongoDB

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

**Deployment Checklist:**

- [ ] MongoDB database created and connection string obtained
- [ ] Backend deployed to Railway with environment variables
- [ ] Frontend deployed to Railway with API URL configured
- [ ] CORS configured correctly
- [ ] Test registration and login
- [ ] Test all major features
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring and alerts
