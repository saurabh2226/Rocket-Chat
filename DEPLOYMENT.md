# Deploying Rocket Chat to Render

This guide will walk you through deploying your Rocket Chat application to Render. The deployment consists of two services:
1. **Backend API** - Node.js/Express server with Socket.io
2. **Frontend** - React static site

## Prerequisites

Before you start, make sure you have:
- ✅ A [Render account](https://render.com) (free tier available)
- ✅ A [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (free tier available)
- ✅ Your Firebase project credentials
- ✅ Your code pushed to a GitHub repository

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account
2. Create a new cluster (choose the free M0 tier)
3. Click **"Connect"** on your cluster
4. Select **"Connect your application"**
5. Copy the connection string - it will look like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database password
7. Replace `dbname` with your desired database name (e.g., `rocket-chat`)
8. **Save this connection string** - you'll need it for Render environment variables

### Configure Network Access
1. In MongoDB Atlas, go to **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

## Step 2: Prepare Firebase Credentials

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Open the downloaded JSON file
6. **Copy the entire JSON content as a single line** (remove line breaks)
   - You can use an online JSON minifier or just copy it as-is
7. **Save this JSON string** - you'll need it for Render

## Step 3: Push Code to GitHub

1. Make sure all your changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

## Step 4: Deploy Backend to Render

### Create Backend Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `rocket-chat-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Add Backend Environment Variables

In the **Environment** section, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `8080` | |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string from Step 1 |
| `FRONTEND_URL` | *Leave empty for now* | We'll add this after deploying frontend |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` | Your Firebase JSON from Step 2 (entire JSON as one line) |

5. Click **"Create Web Service"**
6. Wait for the deployment to complete (5-10 minutes)
7. **Copy your backend URL** - it will be like: `https://rocket-chat-backend.onrender.com`

## Step 5: Deploy Frontend to Render

### Create Frontend Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Select the same GitHub repository
3. Configure the service:
   - **Name**: `rocket-chat-frontend` (or your preferred name)
   - **Region**: Choose the same as backend
   - **Branch**: `main`
   - **Root Directory**: leave empty
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

### Add Frontend Environment Variables

In the **Environment** section, add these variables:

| Key | Value | Example |
|-----|-------|---------|
| `REACT_APP_API_URL` | Your backend URL | `https://rocket-chat-backend.onrender.com` |
| `REACT_APP_SOCKET_URL` | Same as API URL | `https://rocket-chat-backend.onrender.com` |
| `REACT_APP_FIREBASE_API_KEY` | From Firebase config | `AIza...` |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | From Firebase config | `your-project.firebaseapp.com` |
| `REACT_APP_FIREBASE_PROJECT_ID` | From Firebase config | `your-project-id` |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | From Firebase config | `your-project.appspot.com` |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config | `123456789` |
| `REACT_APP_FIREBASE_APP_ID` | From Firebase config | `1:123:web:abc` |

> **Where to find Firebase config values?**
> - Go to Firebase Console → Project Settings → General
> - Scroll to "Your apps" section
> - Look for "Firebase SDK snippet" → Config

4. Click **"Create Static Site"**
5. Wait for the deployment to complete (5-10 minutes)
6. **Copy your frontend URL** - it will be like: `https://rocket-chat-frontend.onrender.com`

## Step 6: Update Backend CORS Configuration

1. Go back to your **backend service** in Render Dashboard
2. Navigate to **Environment** variables
3. Update the `FRONTEND_URL` variable:
   - Set it to your frontend URL (e.g., `https://rocket-chat-frontend.onrender.com`)
4. Click **"Save Changes"**
5. The backend will automatically redeploy

## Step 7: Test Your Application

1. Open your frontend URL in a browser
2. Try to register/login
3. Test creating chat rooms
4. Test sending messages
5. Verify real-time updates work

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Check the logs in Render Dashboard
- Verify `MONGO_URI` is correct and MongoDB Atlas allows connections from anywhere
- Ensure `FIREBASE_SERVICE_ACCOUNT` is valid JSON (no line breaks)

**"Firebase credentials not found" error:**
- Verify `FIREBASE_SERVICE_ACCOUNT` environment variable is set
- Check that the JSON is properly formatted (single line)
- Try pasting the JSON again without any extra spaces

**Database connection fails:**
- Verify MongoDB Atlas network access allows 0.0.0.0/0
- Check that database password in URI is correct
- Ensure connection string includes the database name

### Frontend Issues

**"Cannot connect to backend" error:**
- Verify `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL` are set correctly
- Ensure backend `FRONTEND_URL` matches your frontend URL exactly
- Check that backend service is running

**Authentication doesn't work:**
- Verify all Firebase environment variables are set correctly
- Check Firebase Console → Authentication → Sign-in method → Email/Password is enabled

**Real-time messaging doesn't work:**
- Ensure `REACT_APP_SOCKET_URL` matches backend URL
- Check that backend CORS settings include your frontend URL
- Verify backend service is running and healthy

### Free Tier Limitations

**Render Free Tier includes:**
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ Services spin down after 15 minutes of inactivity
- ✅ Cold starts take ~30 seconds

**First visit might be slow:**
- Services on free tier spin down when inactive
- First request after inactivity triggers a cold start (30 seconds)
- Subsequent requests will be fast

## Environment Variables Quick Reference

### Backend (.env)
```env
NODE_ENV=production
PORT=8080
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rocket-chat?retryWrites=true&w=majority
FRONTEND_URL=https://your-frontend.onrender.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### Frontend (.env)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123:web:abc
```

## Updating Your Deployment

Whenever you push changes to your GitHub repository:
1. Render will automatically detect the changes
2. Both services will redeploy automatically
3. You can also trigger manual deploys from the Render Dashboard

## Support

If you encounter any issues:
1. Check the Render logs for error messages
2. Verify all environment variables are set correctly
3. Ensure external services (MongoDB, Firebase) are properly configured
4. Check the Render [documentation](https://render.com/docs) for more help

---

**🎉 Congratulations!** Your Rocket Chat application is now live on Render!
